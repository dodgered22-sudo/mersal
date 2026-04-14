"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  MessageSquare,
  CalendarCheck,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

type ConnectionState = "open" | "close" | "connecting" | "unknown";

interface InstanceInfo {
  instanceName: string;
  state: ConnectionState;
  qrCode?: string;
  qrBase64?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [instance, setInstance] = useState<InstanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);

  const instanceName = user ? `mersal_${user.uid.slice(0, 12)}` : "";

  const initializeInstance = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Check if instance already exists in Firestore
      const userDoc = await getDoc(doc(db(), "users", user.uid));
      const userData = userDoc.data();
      const existingInstanceName =
        userData?.instanceName || instanceName;

      // Try to get the status of existing instance
      let state: ConnectionState = "unknown";
      try {
        const statusRes = await fetch(
          `/api/instance?name=${existingInstanceName}`
        );
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          state = statusData?.instance?.state || "close";
        }
      } catch {
        // Instance might not exist yet
      }

      // If instance doesn't exist or is unknown, create it
      if (state === "unknown") {
        try {
          const createRes = await fetch("/api/instance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instanceName: existingInstanceName,
              userId: user.uid,
            }),
          });

          if (createRes.ok) {
            const createData = await createRes.json();
            // Save instance name to Firestore
            await setDoc(
              doc(db(), "users", user.uid),
              { instanceName: existingInstanceName, updatedAt: serverTimestamp() },
              { merge: true }
            );

            // Check if QR code came back in the creation response
            if (createData?.qrcode?.base64) {
              setInstance({
                instanceName: existingInstanceName,
                state: "connecting",
                qrBase64: createData.qrcode.base64,
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("Create instance error:", err);
        }

        state = "close";
      }

      setInstance({
        instanceName: existingInstanceName,
        state,
      });

      // If not connected, fetch QR code
      if (state !== "open") {
        await fetchQRCode(existingInstanceName);
      }
    } catch (error) {
      console.error("Initialize error:", error);
      toast.error("Failed to initialize WhatsApp instance");
    } finally {
      setLoading(false);
    }
  }, [user, instanceName]);

  const fetchQRCode = async (name: string) => {
    setQrLoading(true);
    try {
      const res = await fetch(`/api/instance/qrcode?name=${name}`);
      if (res.ok) {
        const data = await res.json();
        setInstance((prev) =>
          prev
            ? {
                ...prev,
                state: "connecting",
                qrBase64: data.base64 || undefined,
                qrCode: data.code || undefined,
              }
            : null
        );
      }
    } catch (error) {
      console.error("QR code error:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const refreshStatus = async () => {
    if (!instance) return;
    try {
      const res = await fetch(`/api/instance?name=${instance.instanceName}`);
      if (res.ok) {
        const data = await res.json();
        const newState: ConnectionState =
          data?.instance?.state || "close";
        setInstance((prev) => (prev ? { ...prev, state: newState } : null));

        if (newState === "open") {
          toast.success("WhatsApp connected!");
        } else {
          await fetchQRCode(instance.instanceName);
        }
      }
    } catch {
      // ignore
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeInstance();
  }, [initializeInstance]);

  // Poll connection status every 10 seconds when not connected
  useEffect(() => {
    if (!instance || instance.state === "open") return;
    const interval = setInterval(refreshStatus, 10000);
    return () => clearInterval(interval);
  }, [instance?.instanceName, instance?.state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Setting up your WhatsApp instance...
        </p>
      </div>
    );
  }

  const isConnected = instance?.state === "open";

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card
        className={`border-2 ${
          isConnected
            ? "border-green-500/30 bg-green-50/50"
            : "border-amber-500/30 bg-amber-50/50"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Status Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <Wifi className="h-6 w-6 text-green-600" />
                ) : (
                  <WifiOff className="h-6 w-6 text-amber-600" />
                )}
                <h2 className="text-xl font-bold">
                  {isConnected ? "WhatsApp Connected" : "Connect WhatsApp"}
                </h2>
                <Badge
                  variant={isConnected ? "default" : "secondary"}
                  className={
                    isConnected
                      ? "bg-green-600 text-white"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {instance?.state || "unknown"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? "Your WhatsApp is connected and ready to send messages."
                  : "Scan the QR code with your WhatsApp to connect."}
              </p>
              {instance && (
                <p className="text-xs text-muted-foreground font-mono">
                  Instance: {instance.instanceName}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshStatus}
                  disabled={qrLoading}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      qrLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                {!isConnected && instance && (
                  <Button
                    size="sm"
                    onClick={() => fetchQRCode(instance.instanceName)}
                    disabled={qrLoading}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    New QR Code
                  </Button>
                )}
              </div>
            </div>

            {/* QR Code */}
            {!isConnected && instance?.qrBase64 && (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl border-2 border-border bg-white p-3 shadow-lg">
                  <img
                    src={instance.qrBase64}
                    alt="WhatsApp QR Code"
                    className="h-56 w-56"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-[240px]">
                  Open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a
                  Device
                </p>
              </div>
            )}

            {isConnected && (
              <div className="flex items-center gap-3 rounded-xl bg-green-100 px-6 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">All Set!</p>
                  <p className="text-sm text-green-700">
                    Ready to send messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Send,
            label: "Messages Sent",
            value: "0",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: MessageSquare,
            label: "Messages Received",
            value: "0",
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            icon: CalendarCheck,
            label: "Appointments",
            value: "0",
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            icon: Users,
            label: "Contacts",
            value: "0",
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <a href="/dashboard/messages" className="block">
              <Send className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Send Message</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Send a quick WhatsApp message to any number
              </p>
            </a>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <a href="/dashboard/bulk" className="block">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Bulk Messaging</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Send messages to multiple contacts at once
              </p>
            </a>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="p-5">
            <a href="/dashboard/bookings" className="block">
              <CalendarCheck className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Manage Bookings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage appointment bookings
              </p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Wifi,
  WifiOff,
  Trash2,
  RefreshCw,
  Loader2,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const [instanceName, setInstanceName] = useState("");
  const [connectionState, setConnectionState] = useState("unknown");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || "");

    const load = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        const name =
          data?.instanceName || `mersal_${user.uid.slice(0, 12)}`;
        setInstanceName(name);

        const res = await fetch(`/api/instance?name=${name}`);
        if (res.ok) {
          const statusData = await res.json();
          setConnectionState(statusData?.instance?.state || "close");
        }
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { name: displayName });
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!instanceName) return;
    try {
      const res = await fetch(
        `/api/instance?name=${instanceName}&action=logout`,
        { method: "GET" }
      );
      toast.success("Disconnected. You can reconnect from the dashboard.");
      setConnectionState("close");
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConnected = connectionState === "open";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account and WhatsApp connection
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Profile</h3>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Instance */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-amber-600" />
            )}
            <h3 className="font-semibold text-lg">WhatsApp Instance</h3>
            <Badge
              className={
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }
            >
              {connectionState}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Instance Name</Label>
              <Input value={instanceName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/api/webhook`
                    : "/api/webhook"
                }
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Configure this URL in your Evolution API webhook settings
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.replace("/dashboard")}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
            {isConnected && (
              <Button variant="destructive" onClick={handleDisconnect}>
                <WifiOff className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-lg text-destructive">
              Danger Zone
            </h3>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Deleting your instance will disconnect your WhatsApp and remove all
            associated data. This action cannot be undone.
          </p>
          <Button variant="destructive" size="sm" disabled>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Instance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

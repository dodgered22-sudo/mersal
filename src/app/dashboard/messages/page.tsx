"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface SendResult {
  number: string;
  success: boolean;
  timestamp: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<SendResult[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !number.trim() || !message.trim()) return;

    setSending(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const instanceName =
        userDoc.data()?.instanceName || `mersal_${user.uid.slice(0, 12)}`;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName,
          number: number.trim(),
          text: message.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Message sent!");
        setHistory((prev) => [
          {
            number: number.trim(),
            success: true,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        setMessage("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send message");
        setHistory((prev) => [
          {
            number: number.trim(),
            success: false,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Send Message</h2>
        <p className="text-muted-foreground mt-1">
          Send a WhatsApp message to any number
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input
                id="number"
                placeholder="e.g. 966501234567 (with country code, no +)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Include country code without + or spaces
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Messages</h3>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {item.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.success ? "default" : "destructive"}>
                    {item.success ? "Sent" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

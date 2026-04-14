"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface BulkResult {
  number: string;
  success: boolean;
}

export default function BulkSendPage() {
  const { user } = useAuth();
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<BulkResult[]>([]);

  const handleBulkSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !numbers.trim() || !message.trim()) return;

    const numberList = numbers
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (numberList.length === 0) {
      toast.error("Please enter at least one number");
      return;
    }

    setSending(true);
    setProgress(0);
    setTotal(numberList.length);
    setResults([]);

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const instanceName =
        userDoc.data()?.instanceName || `mersal_${user.uid.slice(0, 12)}`;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName,
          numbers: numberList,
          text: message.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const bulkResults: BulkResult[] = (data.results || []).map(
          (r: any) => ({
            number: r.number,
            success: r.success,
          })
        );
        setResults(bulkResults);
        setProgress(numberList.length);

        const successCount = bulkResults.filter((r) => r.success).length;
        toast.success(
          `Sent ${successCount}/${numberList.length} messages successfully`
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Bulk send failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bulk Messaging</h2>
        <p className="text-muted-foreground mt-1">
          Send the same message to multiple WhatsApp numbers
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleBulkSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numbers">Phone Numbers</Label>
              <Textarea
                id="numbers"
                placeholder={"966501234567\n966509876543\n201234567890"}
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                One number per line, with country code, no + or spaces
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

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {numbers.split("\n").filter((n) => n.trim()).length} numbers
              </p>
              <Badge variant="secondary">
                ~1.5s delay between messages
              </Badge>
            </div>

            <Button type="submit" disabled={sending} className="w-full">
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending {progress}/{total}...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Bulk Messages
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress/Results */}
      {sending && total > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {progress}/{total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${(progress / total) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Results</h3>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {successCount} sent
                </Badge>
                {failCount > 0 && (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="mr-1 h-3 w-3" />
                    {failCount} failed
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm font-mono">{r.number}</span>
                  {r.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Important</p>
            <p className="mt-1">
              Messages are sent with a 1.5 second delay between each to avoid
              WhatsApp rate limits. Large batches will take time to complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  Plus,
  Clock,
  User,
  Phone,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  service: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: any;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    date: "",
    time: "",
    service: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Booking[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Booking[];
        setBookings(items);
        setLoading(false);
      },
      (error) => {
        console.error("Bookings listen error:", error);
        setLoading(false);
      }
    );

    return unsub;
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      await addDoc(collection(db, "bookings"), {
        ...form,
        userId: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success("Booking created!");
      setForm({
        customerName: "",
        customerPhone: "",
        date: "",
        time: "",
        service: "",
        notes: "",
      });
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    bookingId: string,
    status: Booking["status"]
  ) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status });
      toast.success(`Booking ${status}`);
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      toast.success("Booking deleted");
    } catch (error: any) {
      toast.error("Failed to delete booking");
    }
  };

  const sendReminder = async (booking: Booking) => {
    if (!user) return;
    try {
      const userDocSnap = await import("firebase/firestore").then(
        ({ getDoc }) => getDoc(doc(db, "users", user.uid))
      );
      const instanceName =
        userDocSnap.data()?.instanceName || `mersal_${user.uid.slice(0, 12)}`;

      const text = `Hi ${booking.customerName}, this is a reminder for your appointment:\n\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}\n\nPlease reply to confirm or cancel.`;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceName,
          number: booking.customerPhone,
          text,
        }),
      });

      if (res.ok) {
        toast.success("Reminder sent!");
      } else {
        toast.error("Failed to send reminder");
      }
    } catch {
      toast.error("Failed to send reminder");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-muted-foreground mt-1">
            Manage appointments and send reminders via WhatsApp
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Booking
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogTitle>Create Booking</DialogTitle>
            <DialogDescription>
              Add a new appointment booking
            </DialogDescription>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="966501234567"
                    value={form.customerPhone}
                    onChange={(e) =>
                      setForm({ ...form, customerPhone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Input
                  placeholder="e.g. Consultation, Haircut, Meeting"
                  value={form.service}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional notes..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarCheck className="mr-2 h-4 w-4" />
                  )}
                  Create Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No bookings yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first booking to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {booking.customerName}
                      </h3>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {booking.customerPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.time}
                      </span>
                    </div>
                    <p className="text-sm">
                      <strong>Service:</strong> {booking.service}
                    </p>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground">
                        {booking.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendReminder(booking)}
                    >
                      Send Reminder
                    </Button>
                    {booking.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking.id, "confirmed")}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Confirm
                      </Button>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking.id, "completed")}
                      >
                        Complete
                      </Button>
                    )}
                    {booking.status !== "cancelled" &&
                      booking.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus(booking.id, "cancelled")
                          }
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Cancel
                        </Button>
                      )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteBooking(booking.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";

// API route for creating bookings programmatically (e.g., from n8n workflows)
// This allows external systems to create bookings via POST request

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = process.env.EVOLUTION_API_KEY;

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      userId,
      customerName,
      customerPhone,
      date,
      time,
      service,
      notes,
    } = body;

    if (!userId || !customerName || !customerPhone || !date || !time || !service) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId, customerName, customerPhone, date, time, service",
        },
        { status: 400 }
      );
    }

    // Return booking data to be stored by the caller (n8n can write to Firestore directly)
    // Or forward to n8n for processing
    const booking = {
      userId,
      customerName,
      customerPhone,
      date,
      time,
      service,
      notes: notes || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      source: "api",
    };

    // Forward to n8n if configured
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (n8nUrl) {
      try {
        await fetch(`${n8nUrl}/booking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(booking),
        });
      } catch {
        // n8n forwarding is best-effort
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created. Store in Firestore via client or n8n.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

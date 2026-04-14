import { NextRequest, NextResponse } from "next/server";

// In-memory store for recent webhook events (persists until server restart)
// In production, this would be stored in a database
const recentEvents: Array<{
  id: string;
  event: string;
  instance: string;
  data: any;
  receivedAt: string;
}> = [];
const MAX_EVENTS = 500;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, instance, data } = body;

    // Store in memory
    const eventRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      event: event || "unknown",
      instance: instance || "unknown",
      data,
      receivedAt: new Date().toISOString(),
    };
    recentEvents.unshift(eventRecord);
    if (recentEvents.length > MAX_EVENTS) {
      recentEvents.length = MAX_EVENTS;
    }

    // Forward to n8n if configured
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (n8nUrl) {
      try {
        await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (n8nError) {
        console.error("Failed to forward to n8n:", n8nError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ events: recentEvents.slice(0, 50) });
}

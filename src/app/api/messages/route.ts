import { NextRequest, NextResponse } from "next/server";

const EVOLUTION_API_URL =
  process.env.EVOLUTION_API_URL ||
  process.env.NEXT_PUBLIC_EVOLUTION_API_URL ||
  "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { instanceName, number, text, numbers } = await req.json();

    if (!instanceName || !text) {
      return NextResponse.json(
        { error: "instanceName and text are required" },
        { status: 400 }
      );
    }

    // Bulk send
    if (numbers && Array.isArray(numbers)) {
      const results = [];
      for (const num of numbers) {
        try {
          const res = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${instanceName}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: EVOLUTION_API_KEY,
              },
              body: JSON.stringify({ number: num, text }),
            }
          );
          const data = await res.json();
          results.push({ number: num, success: res.ok, data });
        } catch (err: any) {
          results.push({ number: num, success: false, error: err.message });
        }
        // Delay between messages to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1500));
      }
      return NextResponse.json({ results });
    }

    // Single send
    if (!number) {
      return NextResponse.json(
        { error: "number is required for single message" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({ number, text }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const EVOLUTION_API_URL =
  process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const instanceName = req.nextUrl.searchParams.get("name");
    if (!instanceName) {
      return NextResponse.json(
        { error: "Instance name is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
      { headers: { apikey: EVOLUTION_API_KEY } }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Failed to get QR code: ${errorText}` },
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

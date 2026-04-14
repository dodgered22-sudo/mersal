import { NextRequest, NextResponse } from "next/server";

const EVOLUTION_API_URL =
  process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { instanceName, userId } = await req.json();

    if (!instanceName || !userId) {
      return NextResponse.json(
        { error: "instanceName and userId are required" },
        { status: 400 }
      );
    }

    const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName,
        token: userId,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      if (errorText.includes("already") || createRes.status === 403) {
        return NextResponse.json({ alreadyExists: true, instanceName });
      }
      return NextResponse.json(
        { error: `Evolution API error: ${errorText}` },
        { status: createRes.status }
      );
    }

    const data = await createRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const instanceName = req.nextUrl.searchParams.get("name");

    if (!instanceName) {
      const res = await fetch(
        `${EVOLUTION_API_URL}/instance/fetchInstances`,
        { headers: { apikey: EVOLUTION_API_KEY } }
      );
      if (!res.ok) throw new Error("Failed to fetch instances");
      const data = await res.json();
      return NextResponse.json(data);
    }

    const res = await fetch(
      `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
      { headers: { apikey: EVOLUTION_API_KEY } }
    );
    if (!res.ok) throw new Error("Failed to get status");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

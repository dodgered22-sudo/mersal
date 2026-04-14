const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "http://localhost:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export interface EvolutionInstance {
  instanceName: string;
  instanceId: string;
  status: string;
}

export interface QRCodeResponse {
  pairingCode: string | null;
  code: string;
  base64: string;
  count: number;
}

export async function createInstance(instanceName: string, token?: string) {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      instanceName,
      token: token || "",
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create instance: ${error}`);
  }
  return res.json();
}

export async function getInstanceStatus(instanceName: string) {
  const res = await fetch(
    `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
    {
      headers: { apikey: EVOLUTION_API_KEY },
    }
  );
  if (!res.ok) throw new Error("Failed to get instance status");
  return res.json();
}

export async function getQRCode(instanceName: string) {
  const res = await fetch(
    `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
    {
      headers: { apikey: EVOLUTION_API_KEY },
    }
  );
  if (!res.ok) throw new Error("Failed to get QR code");
  return res.json() as Promise<QRCodeResponse>;
}

export async function sendTextMessage(
  instanceName: string,
  number: string,
  text: string
) {
  const res = await fetch(
    `${EVOLUTION_API_URL}/message/sendText/${instanceName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number,
        text,
      }),
    }
  );
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function sendBulkMessages(
  instanceName: string,
  numbers: string[],
  text: string
) {
  const results = [];
  for (const number of numbers) {
    try {
      const result = await sendTextMessage(instanceName, number, text);
      results.push({ number, success: true, result });
    } catch (error) {
      results.push({ number, success: false, error: String(error) });
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return results;
}

export async function fetchInstances() {
  const res = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
    headers: { apikey: EVOLUTION_API_KEY },
  });
  if (!res.ok) throw new Error("Failed to fetch instances");
  return res.json();
}

export async function deleteInstance(instanceName: string) {
  const res = await fetch(
    `${EVOLUTION_API_URL}/instance/delete/${instanceName}`,
    {
      method: "DELETE",
      headers: { apikey: EVOLUTION_API_KEY },
    }
  );
  if (!res.ok) throw new Error("Failed to delete instance");
  return res.json();
}

export async function logoutInstance(instanceName: string) {
  const res = await fetch(
    `${EVOLUTION_API_URL}/instance/logout/${instanceName}`,
    {
      method: "DELETE",
      headers: { apikey: EVOLUTION_API_KEY },
    }
  );
  if (!res.ok) throw new Error("Failed to logout instance");
  return res.json();
}

export async function setWebhook(instanceName: string, webhookUrl: string) {
  const res = await fetch(
    `${EVOLUTION_API_URL}/webhook/set/${instanceName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        events: [
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "CONNECTION_UPDATE",
          "QRCODE_UPDATED",
        ],
      }),
    }
  );
  if (!res.ok) throw new Error("Failed to set webhook");
  return res.json();
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  MessageSquare,
  CalendarCheck,
  Bot,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const workflows = [
  {
    id: "auto-reply",
    name: "Auto Reply Bot",
    description:
      "Automatically reply to incoming WhatsApp messages with AI-generated responses using n8n.",
    icon: Bot,
    status: "available",
    n8nTemplate: true,
  },
  {
    id: "booking-confirm",
    name: "Booking Confirmation",
    description:
      "Automatically send confirmation messages when a new booking is created.",
    icon: CalendarCheck,
    status: "available",
    n8nTemplate: true,
  },
  {
    id: "reminder",
    name: "Appointment Reminders",
    description:
      "Send automated reminders 24h and 1h before scheduled appointments.",
    icon: MessageSquare,
    status: "available",
    n8nTemplate: true,
  },
  {
    id: "welcome",
    name: "Welcome Message",
    description:
      "Send a welcome message to new contacts who message you for the first time.",
    icon: Zap,
    status: "available",
    n8nTemplate: true,
  },
];

export default function WorkflowsPage() {
  const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    ? new URL(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL).origin
    : "http://localhost:5678";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Workflows</h2>
        <p className="text-muted-foreground mt-1">
          Automate tasks with n8n workflow templates
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">n8n Workflow Engine</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your WhatsApp instance to n8n for powerful automation.
              Your webhook endpoint is:{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/webhook`
                  : "/api/webhook"}
              </code>
            </p>
          </div>
          <a href={n8nUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Open n8n <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Button>
          </a>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {workflows.map((wf) => (
          <Card
            key={wf.id}
            className="hover:border-primary/30 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <wf.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{wf.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      n8n Template
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {wf.description}
                  </p>
                  <a href={n8nUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="link" size="sm" className="mt-2 px-0 h-auto">
                      Set up in n8n <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Setup Instructions</h3>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              Open your n8n instance and create a new workflow
            </li>
            <li>
              Add a <strong>Webhook</strong> trigger node and set the URL to
              your app&apos;s webhook endpoint
            </li>
            <li>
              In your Evolution API settings, configure the webhook to point to:{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/webhook`
                  : "/api/webhook"}
              </code>
            </li>
            <li>
              Add processing nodes (AI, database, etc.) to handle incoming
              messages
            </li>
            <li>
              Use the Evolution API HTTP Request node to send replies back
              through WhatsApp
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

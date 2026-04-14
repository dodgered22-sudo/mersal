# Mersal - WhatsApp Automation & AI Chatbot Platform

Mersal is a self-hosted WhatsApp automation platform with AI chatbots, bulk messaging, booking/appointment management, and workflow automation via n8n.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS v4, shadcn/ui
- **Auth & Database**: Firebase (Auth + Firestore)
- **WhatsApp Gateway**: Evolution API
- **Workflow Automation**: n8n
- **Deployment**: Docker + Coolify ready

## Features

- WhatsApp instance auto-creation on user login
- QR code scanning to connect WhatsApp
- Single & bulk message sending
- Booking/appointment management with WhatsApp reminders
- n8n workflow integration (auto-reply, reminders, etc.)
- Webhook endpoint for incoming messages
- Self-hosted via Docker Compose / Coolify

## Quick Start (Development)

1. **Clone and install:**
   ```bash
   cd mersal
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Fill in your Firebase and Evolution API credentials
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment (Production / Coolify)

### Full Stack with Docker Compose

This starts: Mersal app, Evolution API, n8n, PostgreSQL, and Redis.

```bash
# Set environment variables
cp .env.example .env

# Start all services
docker compose up -d
```

### Services & Ports

| Service        | Port  | URL                          |
|---------------|-------|------------------------------|
| Mersal App    | 3000  | http://localhost:3000        |
| Evolution API | 8080  | http://localhost:8080        |
| n8n           | 5678  | http://localhost:5678        |
| PostgreSQL    | 5432  | -                            |
| Redis         | 6379  | -                            |

### Coolify Deployment

1. Create a new project in Coolify
2. Add each service as a separate resource, or use the `docker-compose.yml`
3. Set environment variables in Coolify's UI
4. Deploy

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_EVOLUTION_API_URL` | Evolution API URL (default: http://localhost:8080) |
| `EVOLUTION_API_KEY` | Evolution API authentication key |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | n8n webhook base URL |
| `NEXT_PUBLIC_APP_URL` | Public URL of the Mersal app |

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Add Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /bookings/{bookingId} {
         allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
         allow create: if request.auth != null;
       }
     }
   }
   ```
5. Copy your Firebase config to `.env.local`

## n8n Workflow Setup

1. Open n8n at http://localhost:5678
2. Create a new workflow with a **Webhook** trigger
3. Set your Evolution API webhook to: `http://your-app-url/api/webhook`
4. The webhook forwards all events to n8n automatically
5. Use HTTP Request nodes to call Evolution API for sending replies

## Architecture

```
User -> Mersal App (Next.js)
           |
           +-> Firebase Auth (login/signup)
           +-> Firebase Firestore (users, bookings)
           +-> Evolution API (WhatsApp)
           |      +-> QR Code generation
           |      +-> Send/receive messages
           |      +-> Webhook -> /api/webhook
           +-> n8n (workflow automation)
                  +-> Auto-replies
                  +-> Appointment reminders
                  +-> Custom workflows
```

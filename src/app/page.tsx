"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Bot,
  CalendarCheck,
  Send,
  Zap,
  Shield,
  BarChart3,
  Users,
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp Automation",
    desc: "Send & receive messages automatically. Bulk messaging with smart delays and scheduling.",
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    desc: "Intelligent auto-replies powered by AI. Handle customer queries 24/7 without lifting a finger.",
  },
  {
    icon: CalendarCheck,
    title: "Booking & Appointments",
    desc: "Let customers book appointments directly through WhatsApp. Auto-confirmations & reminders.",
  },
  {
    icon: Send,
    title: "Bulk Messaging",
    desc: "Reach thousands of contacts with personalized messages. Smart throttling to avoid bans.",
  },
  {
    icon: Zap,
    title: "n8n Workflow Integration",
    desc: "Connect to 400+ apps via n8n. Automate complex workflows with drag-and-drop simplicity.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "End-to-end encryption. Self-hosted on your infrastructure via Coolify for complete control.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    features: [
      "1 WhatsApp Instance",
      "100 messages/day",
      "Basic AI chatbot",
      "Manual bookings",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/mo",
    features: [
      "5 WhatsApp Instances",
      "Unlimited messages",
      "Advanced AI chatbot",
      "Auto bookings & reminders",
      "n8n workflow access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    features: [
      "Unlimited instances",
      "Unlimited messages",
      "Custom AI training",
      "Full booking suite",
      "Custom n8n workflows",
      "Dedicated support",
      "White-label option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const stats = [
  { value: "10M+", label: "Messages Sent" },
  { value: "5K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "50+", label: "Countries" },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Mersal</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-3 bg-background">
            <a href="#features" className="block text-sm" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#pricing" className="block text-sm" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#how-it-works" className="block text-sm" onClick={() => setMobileOpen(false)}>How It Works</a>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Log in</Button></Link>
              <Link href="/signup" className="flex-1"><Button className="w-full" size="sm">Sign up</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <motion.div
          className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40 text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Zap className="mr-1 h-3.5 w-3.5" /> Powered by Evolution API & n8n
            </Badge>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl"
          >
            Automate WhatsApp with{" "}
            <span className="text-primary">AI-Powered</span> Intelligence
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Send bulk messages, manage bookings, and deploy AI chatbots — all from one
            platform. Self-hosted, secure, and scalable.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Start for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                See How It Works
              </Button>
            </a>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="mb-4">Features</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
              Everything You Need to Scale WhatsApp
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From simple auto-replies to complex workflow automations, Mersal has you covered.
            </motion.p>
          </motion.div>
          <motion.div
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="mb-4">How It Works</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
              Get Started in 3 Simple Steps
            </motion.h2>
          </motion.div>
          <motion.div
            className="mt-16 grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              { step: "01", icon: Users, title: "Create Account", desc: "Sign up and log in. Your WhatsApp instance is created automatically." },
              { step: "02", icon: MessageSquare, title: "Scan QR Code", desc: "Scan the QR code with WhatsApp to connect your number instantly." },
              { step: "03", icon: Zap, title: "Automate & Scale", desc: "Set up chatbots, bulk messages, and booking workflows. You're live!" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp}>
                <Card className="relative overflow-hidden border-border/50">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">{item.step}</div>
                  <CardContent className="p-6 pt-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="mb-4">Pricing</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-muted-foreground">
              Start free. Scale when you&apos;re ready.
            </motion.p>
          </motion.div>
          <motion.div
            className="mt-16 grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {plans.map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}>
                <Card className={`relative h-full ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="block mt-8">
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="rounded-2xl bg-primary p-12 text-center text-primary-foreground"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Transform Your WhatsApp?
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Join thousands of businesses automating their WhatsApp communication with Mersal.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="h-12 px-8">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Mersal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Mersal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Headphones } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TelegramIcon } from "@/components/TelegramIcon";
import { TELEGRAM_CHANNEL, WHATSAPP_SUPPORT } from "@/lib/store";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Customer Support — Moniepoint Pay" }] }),
  component: Support,
});

const options = [
  {
    icon: MessageCircle,
    title: "WhatsApp Customer Service",
    sub: "Chat 1-on-1 with an agent on WhatsApp",
    color: "#25D366",
    href: WHATSAPP_SUPPORT,
  },
  {
    icon: TelegramIcon,
    title: "JOIN OUR TELEGRAM CHANNEL",
    sub: "Get updates & community support",
    color: "var(--primary)",
    href: TELEGRAM_CHANNEL,
  },
  {
    icon: Headphones,
    title: "Live Chat",
    sub: "Talk to our team in-app, 24/7",
    color: "#0000FF",
    href: "#",
  },
];

function Support() {
  const router = useRouter();
  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col bg-background text-foreground">
        <div className="px-6 pt-10 pb-6 relative overflow-hidden brand-gradient text-white">
          <button onClick={() => router.history.back()} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="mt-4 text-xl font-black tracking-tight">Customer Support</h1>
          <p className="text-xs opacity-90 mt-1">Hi, I'm Jane — how can we help you today?</p>
        </div>

        <div className="px-6 py-6 space-y-3">
          {options.map((o, i) => (
            <motion.a
              key={o.title}
              href={o.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${o.color} 9%, transparent)` }}>
                <o.icon className="h-6 w-6" style={{ color: o.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{o.title}</p>
                <p className="text-[11px] text-muted-foreground">{o.sub}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Globe2, ShieldCheck, Users, Zap, ArrowRight } from "lucide-react";
import type { ComponentType } from "react";
import { MoniepointLogo } from "@/components/MoniepointLogo";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Moniepoint Pay" },
      { name: "description", content: "Secure digital payments made simple." },
    ],
  }),
  component: Welcome,
});

type Card = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  color: string;
};

const CARDS: Card[] = [
  { icon: Globe2, title: "24/7 Banking", text: "Access your account anytime, anywhere.", color: "#0000FF" },
  { icon: ShieldCheck, title: "Secure Account", text: "Your funds are protected with advanced security.", color: "#16A34A" },
  { icon: Users, title: "Lots of Testimonies", text: "Thousands of happy users trust MONIEPOINT PAY.", color: "#EA580C" },
  { icon: Zap, title: "Instant Transfer", text: "Send and receive money instantly.", color: "#DB2777" },
];

function MarqueeCard({ c }: { c: Card }) {
  const Icon = c.icon;
  return (
    <div
      className="shrink-0 w-[200px] mx-2 rounded-2xl p-4 bg-card border border-border text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="mx-auto h-10 w-10 rounded-full flex items-center justify-center"
        style={{ background: `${c.color}15`, color: c.color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-2 font-semibold text-xs">{c.title}</h3>
      <p className="mt-1 text-[10px] text-muted-foreground leading-snug">{c.text}</p>
    </div>
  );
}

function Welcome() {
  const navigate = useNavigate();
  // Duplicate the cards for seamless loop
  const loop = [...CARDS, ...CARDS];

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <MoniepointLogo size={72} rounded={20} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 text-center"
        >
          <p className="text-sm font-medium tracking-wide uppercase" style={{ color: "#0000FF" }}>
            WELCOME TO
          </p>
          <h1 className="mt-1 text-lg font-black tracking-tight" style={{ color: "#0000FF" }}>
            MONIEPOINT PAY
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Secure digital payments made simple.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed px-3">
            Send money instantly, manage transactions, pay bills, and access financial services.
          </p>
        </motion.div>

        {/* Marquee */}
        <div className="mt-8 -mx-6 overflow-hidden relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10"
            style={{ background: "linear-gradient(to right, var(--surface), transparent)" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10"
            style={{ background: "linear-gradient(to left, var(--surface), transparent)" }}
          />
          <motion.div
            className="flex"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {loop.map((c, i) => (
              <MarqueeCard key={`${c.title}-${i}`} c={c} />
            ))}
          </motion.div>
        </div>

        <div className="flex-1" />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/activate" })}
          className="mt-8 w-full h-14 rounded-3xl text-white font-semibold text-base flex items-center justify-center gap-2 brand-gradient"
          style={{ boxShadow: "var(--shadow-float)" }}
        >
          GET STARTED <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </PhoneFrame>
  );
}

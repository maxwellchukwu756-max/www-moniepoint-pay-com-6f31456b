import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft, Banknote, PiggyBank, TrendingUp, Shield, Gift,
  Bitcoin, GraduationCap, Plane, ShoppingBag, Headphones, Sparkles,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/more-services")({
  head: () => ({
    meta: [
      { title: "More Services — Moniepoint Pay" },
      { name: "description", content: "Explore all Moniepoint Pay services in one place." },
    ],
  }),
  component: MoreServicesPage,
});

const moreServices = [
  { slug: "loans", icon: Banknote, label: "Loans", color: "#0D9488" },
  { slug: "savings", icon: PiggyBank, label: "Savings", color: "#7C3AED" },
  { slug: "investment", icon: TrendingUp, label: "Investment", color: "#059669" },
  { slug: "insurance", icon: Shield, label: "Insurance", color: "#2563EB" },
  { slug: "gift-cards", icon: Gift, label: "Gift Cards", color: "#E11D48" },
  { slug: "crypto", icon: Bitcoin, label: "Crypto", color: "#F59E0B" },
  { slug: "education", icon: GraduationCap, label: "Education", color: "#4338CA" },
  { slug: "flights", icon: Plane, label: "Flights", color: "#0EA5E9" },
  { slug: "shopping", icon: ShoppingBag, label: "Shopping", color: "#BE185D" },
  { slug: "earn-more", icon: Sparkles, label: "Earn More", color: "#16A34A" },
  { slug: "support", icon: Headphones, label: "Support", color: "#0EA5E9" },
];

function Tile({ a, i }: { a: typeof moreServices[number]; i: number }) {
  const to = a.slug === "support" ? "/support"
    : a.slug === "earn-more" ? "/earn-more"
    : `/service/${a.slug}`;
  return (
    <Link to={to} className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        whileTap={{ scale: 0.9 }}
        className="h-14 w-14 rounded-2xl flex items-center justify-center"
        style={{ background: `${a.color}15`, color: a.color, boxShadow: `0 6px 16px -8px ${a.color}55` }}
      >
        <a.icon className="h-6 w-6" />
      </motion.div>
      <span className="text-[11px] font-semibold text-center leading-tight">{a.label}</span>
    </Link>
  );
}

function MoreServicesPage() {
  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col pb-8">
        <div className="px-6 pt-8 flex items-center gap-3">
          <Link to="/dashboard" className="h-9 w-9 rounded-full bg-brand-soft flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Link>
          <h1 className="text-lg font-black">More Services</h1>
        </div>

        <p className="px-6 mt-2 text-xs text-muted-foreground">
          All Moniepoint Pay services in one place. Tap any service to continue.
        </p>

        <div className="px-6 mt-6">
          <div className="bg-card border border-border rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="grid grid-cols-4 gap-y-5 gap-x-2">
              {moreServices.map((a, i) => <Tile key={a.slug} a={a} i={i} />)}
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

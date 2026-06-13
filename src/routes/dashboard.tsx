import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownLeft, Bell, Eye, EyeOff, Plus,
  Send, Receipt, Smartphone, Wallet, ListChecks, Settings,
  Home, CreditCard, User, LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Moniepoint Pay" },
      { name: "description", content: "Your Moniepoint Pay dashboard." },
    ],
  }),
  component: Dashboard,
});

const actions = [
  { icon: Send, label: "Transfer" },
  { icon: Receipt, label: "Pay Bills" },
  { icon: Smartphone, label: "Airtime" },
  { icon: Wallet, label: "Wallet" },
  { icon: ListChecks, label: "Transactions" },
  { icon: Settings, label: "Settings" },
];

const txs = [
  { name: "Airtime Top-up", sub: "MTN · Today, 10:24", amt: "-₦500", in: false },
  { name: "Wallet Funding", sub: "Bank Transfer · Yesterday", amt: "+₦25,000", in: true },
  { name: "DSTV Subscription", sub: "Bills · Jun 11", amt: "-₦8,400", in: false },
];

function Dashboard() {
  const [hidden, setHidden] = useState(false);
  const [tab, setTab] = useState("Home");

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col pb-24">
        {/* Header */}
        <div className="px-6 pt-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full brand-gradient flex items-center justify-center text-white font-bold">
              M
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Good morning 👋</p>
              <p className="font-semibold text-sm">Maxwell</p>
            </div>
          </div>
          <button className="h-11 w-11 rounded-full bg-brand-soft flex items-center justify-center relative">
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-6 rounded-3xl overflow-hidden relative brand-gradient text-white p-6"
          style={{ boxShadow: "var(--shadow-float)" }}
        >
          <div
            className="absolute -right-12 -top-12 h-44 w-44 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div
            className="absolute -left-8 -bottom-16 h-40 w-40 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest opacity-80">Available Balance</span>
            <button onClick={() => setHidden(h => !h)} className="opacity-90">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-tight">
            {hidden ? "₦••••••" : "₦175,000.00"}
          </h2>
          <div className="mt-5 flex gap-3">
            <button className="flex-1 h-10 rounded-xl bg-white text-primary text-sm font-semibold flex items-center justify-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Money
            </button>
            <button className="flex-1 h-10 rounded-xl border border-white/40 text-white text-sm font-semibold flex items-center justify-center gap-1.5">
              <ArrowUpRight className="h-4 w-4" /> Send
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="px-6 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {actions.map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.94 }}
                className="aspect-square rounded-2xl bg-card border border-border flex flex-col items-center justify-center gap-2"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="h-10 w-10 rounded-xl bg-brand-soft flex items-center justify-center">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[11px] font-semibold">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-6 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Recent Transactions</h3>
            <button className="text-xs font-semibold text-primary">See all</button>
          </div>
          <div className="space-y-2">
            {txs.map((t) => (
              <div
                key={t.name}
                className="bg-card border border-border rounded-2xl p-3.5 flex items-center gap-3"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.in ? "bg-brand-soft" : "bg-muted"}`}>
                  {t.in
                    ? <ArrowDownLeft className="h-5 w-5 text-primary" />
                    : <ArrowUpRight className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.sub}</p>
                </div>
                <span className={`text-sm font-bold ${t.in ? "text-primary" : "text-foreground"}`}>
                  {t.amt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="mx-4 mb-4 rounded-3xl glass-card flex items-center justify-around py-2.5 px-2" style={{ boxShadow: "var(--shadow-float)" }}>
          {[
            { icon: Home, label: "Home" },
            { icon: LayoutGrid, label: "Payments" },
            { icon: CreditCard, label: "Cards" },
            { icon: Wallet, label: "Wallet" },
            { icon: User, label: "Profile" },
          ].map((n) => {
            const active = tab === n.label;
            return (
              <button
                key={n.label}
                onClick={() => setTab(n.label)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors"
                style={active ? { background: "var(--brand-soft)" } : undefined}
              >
                <n.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}

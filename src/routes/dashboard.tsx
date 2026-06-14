import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, ArrowDownLeft, Bell, Eye, EyeOff, Plus,
  Send, Receipt, Smartphone, Wallet, Tv, Zap, Trophy, Wifi,
  IdCard, Banknote, PiggyBank, TrendingUp, Shield, Gift,
  Bitcoin, GraduationCap, Plane, ShoppingBag, Headphones,
  Home, CreditCard, User, LayoutGrid,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAccount, useBalance, useTxs, formatNGN } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Moniepoint Pay" },
      { name: "description", content: "Your Moniepoint Pay dashboard." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { slug: "buy-mpay-id", icon: IdCard, label: "Buy MPAY ID", color: "#6D28D9" },
  { slug: "transfer", icon: Send, label: "Transfer", color: "#0000FF" },
  { slug: "airtime", icon: Smartphone, label: "Airtime", color: "#16A34A" },
  { slug: "data", icon: Wifi, label: "Data", color: "#0891B2" },
  { slug: "pay-bills", icon: Receipt, label: "Pay Bills", color: "#EA580C" },
  { slug: "betting", icon: Trophy, label: "Betting", color: "#DC2626" },
  { slug: "electricity", icon: Zap, label: "Electricity", color: "#CA8A04" },
  { slug: "cable-tv", icon: Tv, label: "Cable TV", color: "#DB2777" },
];

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
  { slug: "support", icon: Headphones, label: "Support", color: "#0EA5E9" },
];

// Realistic Nigerian names by ethnic background for the live notifications ticker
const NIGERIAN_FEED = [
  { name: "Chinedu O.", amount: 50000, bank: "GTBank" },
  { name: "Aisha Bello", amount: 12500, bank: "Zenith Bank" },
  { name: "Tunde Adebayo", amount: 25000, bank: "Access Bank" },
  { name: "Ifeoma Eze", amount: 8400, bank: "UBA" },
  { name: "Musa Abubakar", amount: 75000, bank: "First Bank" },
  { name: "Olamide Akinwale", amount: 32000, bank: "Wema Bank" },
  { name: "Ngozi Okafor", amount: 100000, bank: "Sterling Bank" },
  { name: "Hauwa Sani", amount: 18750, bank: "Jaiz Bank" },
  { name: "Emeka Nwankwo", amount: 6500, bank: "Fidelity Bank" },
  { name: "Bisi Ogundipe", amount: 45000, bank: "FCMB" },
  { name: "Yusuf Ibrahim", amount: 90000, bank: "Stanbic IBTC" },
  { name: "Adaeze Uche", amount: 5200, bank: "Polaris Bank" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function ActionTile({ a, i }: { a: typeof quickActions[number]; i: number }) {
  const to = a.slug === "buy-mpay-id" ? "/buy-mpay" : a.slug === "transfer" ? "/transfer" : a.slug === "support" ? "/support" : `/service/${a.slug}`;
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        whileTap={{ scale: 0.9 }}
        className="h-12 w-12 rounded-2xl flex items-center justify-center"
        style={{ background: `${a.color}15`, color: a.color, boxShadow: `0 6px 16px -8px ${a.color}55` }}
      >
        <a.icon className="h-5 w-5" />
      </motion.div>
      <span className="text-[10px] font-semibold text-center leading-tight">{a.label}</span>
    </Link>
  );
}

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(true);
      const hide = setTimeout(() => setVisible(false), 3000);
      const next = setTimeout(() => setIdx((i) => (i + 1) % NIGERIAN_FEED.length), 3600);
      return [hide, next];
    };
    const timers = cycle();
    const interval = setInterval(() => {
      timers.push(...cycle());
    }, 4200);
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  const item = NIGERIAN_FEED[idx];
  const d = new Date();

  return (
    <div className="absolute top-2 left-0 right-0 z-30 flex justify-center pointer-events-none px-3">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="glass-card rounded-2xl px-3 py-2 flex items-center gap-2.5 max-w-[340px] w-full pointer-events-auto"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <div className="h-8 w-8 rounded-full brand-gradient flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {item.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold truncate">
                {item.name} <span className="text-muted-foreground font-medium">transferred</span>
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {item.bank} · {d.toLocaleString("en-NG", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <span className="text-[11px] font-black text-primary shrink-0">{formatNGN(item.amount)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Dashboard() {
  const [hidden, setHidden] = useState(false);
  const [tab, setTab] = useState("Home");
  const { balance } = useBalance();
  const { txs } = useTxs();
  const account = useAccount();
  const greet = useMemo(greeting, []);
  const firstName = account?.fullName?.split(" ")[0] ?? "there";

  return (
    <PhoneFrame>
      <LiveTicker />

      <div className="flex-1 flex flex-col pb-24">
        {/* Header */}
        <div className="px-6 pt-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full brand-gradient flex items-center justify-center text-white font-bold">
              {firstName[0]?.toUpperCase() ?? "M"}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{greet} 👋</p>
              <p className="font-semibold text-sm">{firstName}</p>
            </div>
          </div>
          <button className="h-11 w-11 rounded-full bg-brand-soft flex items-center justify-center relative">
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>

        {/* Jane chat bubble */}
        <Link to="/support" className="mx-6 mt-4 inline-flex">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 bg-card border border-border rounded-full pl-2 pr-4 py-1.5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: "#16A34A" }}>
              J
            </div>
            <span className="text-xs font-semibold">💬 Hi, I'm Jane</span>
          </motion.div>
        </Link>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-4 rounded-3xl overflow-hidden relative brand-gradient text-white p-5"
          style={{ boxShadow: "var(--shadow-float)" }}
        >
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="absolute -left-8 -bottom-16 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest opacity-80">Available Balance</span>
            <button onClick={() => setHidden(h => !h)} className="opacity-90">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight">
            {hidden ? "₦••••••" : formatNGN(balance)}
          </h2>
          <div className="mt-4 flex gap-3">
            <button className="flex-1 h-9 rounded-xl bg-white text-primary text-xs font-semibold flex items-center justify-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Money
            </button>
            <Link to="/transfer" className="flex-1 h-9 rounded-xl border border-white/40 text-white text-xs font-semibold flex items-center justify-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> Send
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {quickActions.map((a, i) => <ActionTile key={a.slug} a={a} i={i} />)}
          </div>
        </div>

        {/* More Services */}
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">More Services</h3>
          </div>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {moreServices.map((a, i) => <ActionTile key={a.slug} a={a} i={i} />)}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Recent Transactions</h3>
            {txs.length > 0 && <button className="text-xs font-semibold text-primary">See all</button>}
          </div>

          {txs.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl py-8 text-center">
              <p className="text-sm font-semibold text-muted-foreground">No Recent Transactions</p>
              <p className="text-[11px] text-muted-foreground/80 mt-1">Your activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {txs.slice(0, 5).map((t) => {
                const isIn = t.amount > 0;
                return (
                  <div
                    key={t.id}
                    className="bg-card border border-border rounded-2xl p-3.5 flex items-center gap-3"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isIn ? "bg-brand-soft" : "bg-muted"}`}>
                      {isIn ? <ArrowDownLeft className="h-5 w-5 text-primary" /> : <ArrowUpRight className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {t.sub} · {new Date(t.dateISO).toLocaleString("en-NG", { month: "short", day: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${isIn ? "text-primary" : "text-foreground"}`}>
                      {isIn ? "+" : "-"}{formatNGN(Math.abs(t.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
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

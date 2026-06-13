import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type ComponentType } from "react";
import {
  ArrowLeft, Send, Smartphone, Wifi, Receipt, Trophy, Zap, Tv,
  IdCard, Banknote, PiggyBank, TrendingUp, Shield, Gift, Bitcoin,
  GraduationCap, Plane, ShoppingBag, Check,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";

type Svc = {
  title: string;
  tagline: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
  fields: { name: string; label: string; placeholder: string; type?: string }[];
  cta: string;
  presets?: string[];
};

const SERVICES: Record<string, Svc> = {
  "buy-mpay-id": {
    title: "Buy MPAY ID",
    tagline: "Get your unique Moniepoint Pay identity",
    color: "#6D28D9",
    icon: IdCard,
    fields: [
      { name: "username", label: "Preferred MPAY ID", placeholder: "e.g. maxwell.pay" },
      { name: "tier", label: "Tier", placeholder: "Standard / Premium" },
    ],
    cta: "Purchase MPAY ID",
  },
  transfer: {
    title: "Transfer Money",
    tagline: "Send instantly to any bank in Nigeria",
    color: "#0000FF",
    icon: Send,
    fields: [
      { name: "bank", label: "Bank", placeholder: "Select bank" },
      { name: "account", label: "Account Number", placeholder: "10-digit account", type: "tel" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
      { name: "narration", label: "Narration", placeholder: "What's it for?" },
    ],
    cta: "Send Money",
  },
  airtime: {
    title: "Buy Airtime",
    tagline: "Top up any network instantly",
    color: "#16A34A",
    icon: Smartphone,
    fields: [
      { name: "phone", label: "Phone Number", placeholder: "0801 234 5678", type: "tel" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
    ],
    presets: ["100", "200", "500", "1000", "2000", "5000"],
    cta: "Buy Airtime",
  },
  data: {
    title: "Buy Data Bundle",
    tagline: "Stay connected on your favorite network",
    color: "#0891B2",
    icon: Wifi,
    fields: [
      { name: "phone", label: "Phone Number", placeholder: "0801 234 5678", type: "tel" },
      { name: "plan", label: "Data Plan", placeholder: "1GB / 2GB / 5GB" },
    ],
    cta: "Buy Data",
  },
  "pay-bills": {
    title: "Pay Bills",
    tagline: "Settle all your utility bills in seconds",
    color: "#EA580C",
    icon: Receipt,
    fields: [
      { name: "biller", label: "Biller", placeholder: "Select biller" },
      { name: "ref", label: "Customer Ref", placeholder: "Account / Meter no." },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
    ],
    cta: "Pay Bill",
  },
  betting: {
    title: "Fund Betting Wallet",
    tagline: "Top up your favorite betting account",
    color: "#DC2626",
    icon: Trophy,
    fields: [
      { name: "platform", label: "Platform", placeholder: "Bet9ja / SportyBet / 1xBet" },
      { name: "userid", label: "Bet User ID", placeholder: "Your bet ID" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
    ],
    cta: "Fund Wallet",
  },
  electricity: {
    title: "Buy Electricity",
    tagline: "Prepaid & postpaid meters, all DISCOs",
    color: "#CA8A04",
    icon: Zap,
    fields: [
      { name: "disco", label: "Disco", placeholder: "EKEDC / IKEDC / AEDC" },
      { name: "meter", label: "Meter Number", placeholder: "Meter no.", type: "tel" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
    ],
    cta: "Buy Token",
  },
  "cable-tv": {
    title: "Cable TV Subscription",
    tagline: "Renew DSTV, GOTV & Startimes",
    color: "#DB2777",
    icon: Tv,
    fields: [
      { name: "provider", label: "Provider", placeholder: "DSTV / GOTV / Startimes" },
      { name: "smartcard", label: "Smartcard / IUC", placeholder: "Smartcard no." },
      { name: "plan", label: "Plan", placeholder: "Compact / Premium" },
    ],
    cta: "Subscribe",
  },
  loans: {
    title: "Quick Loans",
    tagline: "Borrow up to ₦5,000,000 in minutes",
    color: "#0D9488",
    icon: Banknote,
    fields: [
      { name: "amount", label: "Loan Amount (₦)", placeholder: "0.00", type: "number" },
      { name: "tenure", label: "Tenure (months)", placeholder: "3 / 6 / 12", type: "number" },
    ],
    cta: "Request Loan",
  },
  savings: {
    title: "Savings Plan",
    tagline: "Grow your money with up to 15% p.a.",
    color: "#7C3AED",
    icon: PiggyBank,
    fields: [
      { name: "goal", label: "Savings Goal", placeholder: "e.g. New Laptop" },
      { name: "amount", label: "Target (₦)", placeholder: "0.00", type: "number" },
      { name: "freq", label: "Frequency", placeholder: "Daily / Weekly / Monthly" },
    ],
    cta: "Start Saving",
  },
  investment: {
    title: "Investments",
    tagline: "T-Bills, Mutual Funds & Eurobonds",
    color: "#059669",
    icon: TrendingUp,
    fields: [
      { name: "product", label: "Product", placeholder: "T-Bill / Mutual Fund" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
    ],
    cta: "Invest Now",
  },
  insurance: {
    title: "Insurance",
    tagline: "Health, life & motor cover plans",
    color: "#2563EB",
    icon: Shield,
    fields: [
      { name: "type", label: "Cover Type", placeholder: "Health / Motor / Life" },
      { name: "duration", label: "Duration", placeholder: "1 year" },
    ],
    cta: "Get Covered",
  },
  "gift-cards": {
    title: "Gift Cards",
    tagline: "Buy & redeem global gift cards",
    color: "#E11D48",
    icon: Gift,
    fields: [
      { name: "brand", label: "Brand", placeholder: "Amazon / iTunes / Steam" },
      { name: "amount", label: "Value (USD)", placeholder: "0.00", type: "number" },
    ],
    cta: "Buy Gift Card",
  },
  crypto: {
    title: "Crypto",
    tagline: "Buy, sell & swap digital assets",
    color: "#F59E0B",
    icon: Bitcoin,
    fields: [
      { name: "asset", label: "Asset", placeholder: "BTC / ETH / USDT" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
    ],
    cta: "Trade Crypto",
  },
  education: {
    title: "Education",
    tagline: "Pay school fees & exam pins",
    color: "#4338CA",
    icon: GraduationCap,
    fields: [
      { name: "exam", label: "Exam Body", placeholder: "WAEC / NECO / JAMB" },
      { name: "qty", label: "Quantity", placeholder: "1", type: "number" },
    ],
    cta: "Purchase Pin",
  },
  flights: {
    title: "Book Flights",
    tagline: "Local & international tickets",
    color: "#0EA5E9",
    icon: Plane,
    fields: [
      { name: "from", label: "From", placeholder: "Lagos" },
      { name: "to", label: "To", placeholder: "Abuja" },
      { name: "date", label: "Departure", placeholder: "YYYY-MM-DD", type: "date" },
    ],
    cta: "Search Flights",
  },
  shopping: {
    title: "Shopping",
    tagline: "Pay merchants directly from your wallet",
    color: "#BE185D",
    icon: ShoppingBag,
    fields: [
      { name: "merchant", label: "Merchant", placeholder: "Store name" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "number" },
    ],
    cta: "Pay Merchant",
  },
};

export const Route = createFileRoute("/service/$slug")({
  head: ({ params }) => {
    const svc = SERVICES[params.slug];
    return {
      meta: [
        { title: `${svc?.title ?? "Service"} — Moniepoint Pay` },
        { name: "description", content: svc?.tagline ?? "Moniepoint Pay service." },
      ],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const svc = SERVICES[slug];
  const [done, setDone] = useState(false);

  if (!svc) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <p className="text-sm text-muted-foreground">Service not found.</p>
          <Link to="/dashboard" className="text-sm font-semibold text-primary">Back to dashboard</Link>
        </div>
      </PhoneFrame>
    );
  }

  const Icon = svc.icon;

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col">
        {/* Themed header */}
        <div
          className="relative px-6 pt-10 pb-8 text-white overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${svc.color} 0%, ${svc.color}CC 100%)` }}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="absolute -left-8 -bottom-16 h-44 w-44 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="relative flex items-center justify-between">
            <button
              onClick={() => router.history.back()}
              className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative mt-5"
          >
            <h1 className="text-xl font-black tracking-tight">{svc.title}</h1>
            <p className="text-xs opacity-90 mt-1">{svc.tagline}</p>
          </motion.div>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pt-6 pb-8">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center gap-3 pt-12"
            >
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-white"
                style={{ background: svc.color }}
              >
                <Check className="h-8 w-8" />
              </div>
              <p className="text-base font-bold">Request submitted</p>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Your {svc.title.toLowerCase()} request is being processed.
              </p>
              <Link
                to="/dashboard"
                className="mt-4 h-11 px-6 rounded-2xl text-white text-sm font-semibold flex items-center justify-center"
                style={{ background: svc.color }}
              >
                Back to Dashboard
              </Link>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setDone(true); }}
              className="space-y-4"
            >
              {svc.presets && (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Quick Amount
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {svc.presets.map(p => (
                      <button
                        key={p}
                        type="button"
                        className="h-10 rounded-xl border border-border text-xs font-semibold hover:text-white transition-colors"
                        style={{ ['--c' as string]: svc.color }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = svc.color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = svc.color; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
                      >
                        ₦{p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {svc.fields.map(f => (
                <div key={f.name}>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                    {f.label}
                  </label>
                  <input
                    type={f.type ?? "text"}
                    placeholder={f.placeholder}
                    className="w-full h-12 rounded-2xl border border-border bg-card px-4 text-sm font-medium outline-none focus:border-current"
                    style={{ color: "inherit" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = svc.color; e.currentTarget.style.boxShadow = `0 0 0 3px ${svc.color}22`; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
                  />
                </div>
              ))}

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full h-12 rounded-2xl text-white text-sm font-bold mt-2"
                style={{ background: svc.color, boxShadow: `0 14px 28px -12px ${svc.color}88` }}
              >
                {svc.cta}
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}

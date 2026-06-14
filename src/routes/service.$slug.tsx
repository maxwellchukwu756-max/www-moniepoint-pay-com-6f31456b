import { createFileRoute, Link, Navigate, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type ComponentType } from "react";
import {
  ArrowLeft, Smartphone, Wifi, Receipt, Trophy, Zap, Tv,
  Banknote, PiggyBank, TrendingUp, Shield, Gift, Bitcoin,
  GraduationCap, Plane, ShoppingBag, Check,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { MPAY_ID_CODE, formatNGN, useBalance, useTxs, genRef } from "@/lib/store";

type Svc = {
  title: string;
  tagline: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
  fields: { name: string; label: string; placeholder: string; type?: string }[];
  cta: string;
  presets?: string[];
  requiresMpay?: boolean;
};

const SERVICES: Record<string, Svc> = {
  airtime: {
    title: "Buy Airtime", tagline: "Top up any network instantly", color: "#16A34A", icon: Smartphone,
    fields: [
      { name: "phone", label: "Phone Number", placeholder: "0801 234 5678", type: "tel" },
      { name: "network", label: "Network", placeholder: "MTN / Airtel / Glo / 9mobile" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    presets: ["100", "200", "500", "1000", "2000", "5000"],
    cta: "Buy Airtime", requiresMpay: true,
  },
  data: {
    title: "Buy Data Bundle", tagline: "Stay connected on your favorite network", color: "#0891B2", icon: Wifi,
    fields: [
      { name: "phone", label: "Phone Number", placeholder: "0801 234 5678", type: "tel" },
      { name: "network", label: "Network", placeholder: "MTN / Airtel / Glo / 9mobile" },
      { name: "plan", label: "Data Plan", placeholder: "1GB / 2GB / 5GB" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Buy Data", requiresMpay: true,
  },
  "pay-bills": {
    title: "Pay Bills", tagline: "Settle all your utility bills in seconds", color: "#EA580C", icon: Receipt,
    fields: [
      { name: "biller", label: "Biller", placeholder: "Select biller" },
      { name: "ref", label: "Customer Ref", placeholder: "Account / Meter no." },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Pay Bill", requiresMpay: true,
  },
  betting: {
    title: "Fund Betting Wallet", tagline: "Top up your favorite betting account", color: "#DC2626", icon: Trophy,
    fields: [
      { name: "platform", label: "Platform", placeholder: "Bet9ja / SportyBet / 1xBet" },
      { name: "userid", label: "Bet User ID", placeholder: "Your bet ID" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Fund Wallet", requiresMpay: true,
  },
  electricity: {
    title: "Buy Electricity", tagline: "Prepaid & postpaid meters, all DISCOs", color: "#CA8A04", icon: Zap,
    fields: [
      { name: "disco", label: "Disco", placeholder: "EKEDC / IKEDC / AEDC" },
      { name: "meter", label: "Meter Number", placeholder: "Meter no.", type: "tel" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Buy Token", requiresMpay: true,
  },
  "cable-tv": {
    title: "Cable TV Subscription", tagline: "Renew DSTV, GOTV & Startimes", color: "#DB2777", icon: Tv,
    fields: [
      { name: "provider", label: "Provider", placeholder: "DSTV / GOTV / Startimes" },
      { name: "smartcard", label: "Smartcard / IUC", placeholder: "Smartcard no." },
      { name: "plan", label: "Plan", placeholder: "Compact / Premium" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Subscribe", requiresMpay: true,
  },
  loans: {
    title: "Quick Loans", tagline: "Borrow up to ₦5,000,000 in minutes", color: "#0D9488", icon: Banknote,
    fields: [
      { name: "amount", label: "Loan Amount (₦)", placeholder: "0.00", type: "tel" },
      { name: "tenure", label: "Tenure (months)", placeholder: "3 / 6 / 12", type: "tel" },
    ],
    cta: "Request Loan",
  },
  savings: {
    title: "Savings Plan", tagline: "Grow your money with up to 15% p.a.", color: "#7C3AED", icon: PiggyBank,
    fields: [
      { name: "goal", label: "Savings Goal", placeholder: "e.g. New Laptop" },
      { name: "amount", label: "Target (₦)", placeholder: "0.00", type: "tel" },
      { name: "freq", label: "Frequency", placeholder: "Daily / Weekly / Monthly" },
    ],
    cta: "Start Saving",
  },
  investment: {
    title: "Investments", tagline: "T-Bills, Mutual Funds & Eurobonds", color: "#059669", icon: TrendingUp,
    fields: [
      { name: "product", label: "Product", placeholder: "T-Bill / Mutual Fund" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Invest Now",
  },
  insurance: {
    title: "Insurance", tagline: "Health, life & motor cover plans", color: "#2563EB", icon: Shield,
    fields: [
      { name: "type", label: "Cover Type", placeholder: "Health / Motor / Life" },
      { name: "duration", label: "Duration", placeholder: "1 year" },
    ],
    cta: "Get Covered",
  },
  "gift-cards": {
    title: "Gift Cards", tagline: "Buy & redeem global gift cards", color: "#E11D48", icon: Gift,
    fields: [
      { name: "brand", label: "Brand", placeholder: "Amazon / iTunes / Steam" },
      { name: "amount", label: "Value (USD)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Buy Gift Card",
  },
  crypto: {
    title: "Crypto", tagline: "Buy, sell & swap digital assets", color: "#F59E0B", icon: Bitcoin,
    fields: [
      { name: "asset", label: "Asset", placeholder: "BTC / ETH / USDT" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Trade Crypto",
  },
  education: {
    title: "Education", tagline: "Pay school fees & exam pins", color: "#4338CA", icon: GraduationCap,
    fields: [
      { name: "exam", label: "Exam Body", placeholder: "WAEC / NECO / JAMB" },
      { name: "qty", label: "Quantity", placeholder: "1", type: "tel" },
    ],
    cta: "Purchase Pin",
  },
  flights: {
    title: "Book Flights", tagline: "Local & international tickets", color: "#0EA5E9", icon: Plane,
    fields: [
      { name: "from", label: "From", placeholder: "Lagos" },
      { name: "to", label: "To", placeholder: "Abuja" },
      { name: "date", label: "Departure", placeholder: "YYYY-MM-DD", type: "date" },
    ],
    cta: "Search Flights",
  },
  shopping: {
    title: "Shopping", tagline: "Pay merchants directly from your wallet", color: "#BE185D", icon: ShoppingBag,
    fields: [
      { name: "merchant", label: "Merchant", placeholder: "Store name" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ],
    cta: "Pay Merchant",
  },
};

// Slugs that should redirect to dedicated pages
const REDIRECTS: Record<string, string> = {
  "buy-mpay-id": "/buy-mpay",
  transfer: "/transfer",
  support: "/support",
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
  const { balance, setBalance } = useBalance();
  const { addTx } = useTxs();
  const svc = SERVICES[slug];

  const [values, setValues] = useState<Record<string, string>>({});
  const [mpayCode, setMpayCode] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (REDIRECTS[slug]) {
    return <Navigate to={REDIRECTS[slug] as "/buy-mpay"} />;
  }

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (svc.requiresMpay) {
      if (!mpayCode) {
        setError("Please enter your MPAY ID CODE");
        return;
      }
      if (mpayCode !== MPAY_ID_CODE) {
        setError("Incorrect MPAY ID CODE");
        return;
      }
    }

    // If there's an amount field, deduct from balance and log a tx
    const amt = Number(values.amount);
    if (amt && amt > 0) {
      if (amt > balance) {
        setError("Insufficient balance");
        return;
      }
      const ref = genRef();
      addTx({
        id: ref,
        kind: "purchase",
        name: svc.title,
        sub: values.phone || values.meter || values.smartcard || values.ref || svc.title,
        amount: -amt,
        reference: ref,
        dateISO: new Date().toISOString(),
      });
      setBalance(Math.max(0, balance - amt));
    }
    setDone(true);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col">
        <div
          className="relative px-6 pt-10 pb-6 text-white overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${svc.color} 0%, ${svc.color}CC 100%)` }}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="relative flex items-center justify-between">
            <button onClick={() => router.history.back()} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="relative mt-4">
            <h1 className="text-xl font-black tracking-tight">{svc.title}</h1>
            <p className="text-xs opacity-90 mt-1">{svc.tagline}</p>
          </div>
          <div className="mt-3 rounded-xl bg-white/15 backdrop-blur p-2.5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest opacity-90">Balance</span>
            <span className="text-sm font-black">{formatNGN(balance)}</span>
          </div>
        </div>

        <div className="flex-1 px-6 pt-5 pb-8">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center gap-3 pt-12">
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-white" style={{ background: svc.color }}>
                <Check className="h-8 w-8" />
              </div>
              <p className="text-base font-bold">Successful</p>
              <p className="text-xs text-muted-foreground max-w-[240px]">Your {svc.title.toLowerCase()} request was completed.</p>
              <Link to="/dashboard" className="mt-4 h-11 px-6 rounded-2xl text-white text-sm font-semibold flex items-center justify-center" style={{ background: svc.color }}>
                Back to Dashboard
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {svc.presets && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-widest">Quick Amount</p>
                  <div className="grid grid-cols-3 gap-2">
                    {svc.presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setValues((v) => ({ ...v, amount: p }))}
                        className="h-10 rounded-xl border border-border text-xs font-semibold"
                      >
                        ₦{p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {svc.fields.map((f) => (
                <div key={f.name}>
                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 block uppercase tracking-widest">{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full h-11 rounded-xl border border-border bg-muted px-3 text-sm font-medium outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              ))}

              {svc.requiresMpay && (
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 block uppercase tracking-widest">MPAY ID CODE</label>
                  <input
                    value={mpayCode}
                    onChange={(e) => setMpayCode(e.target.value)}
                    placeholder="Enter your MPAY ID CODE"
                    className="w-full h-11 rounded-xl border border-border bg-muted px-3 text-sm font-medium outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              )}

              {error && (
                <div>
                  <p className="text-[11px] font-semibold text-red-600">{error}</p>
                  {error === "Incorrect MPAY ID CODE" && (
                    <Link to="/buy-mpay" className="mt-1 inline-block text-[11px] font-bold text-primary underline">
                      BUY MPAY ID CODE
                    </Link>
                  )}
                </div>
              )}

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

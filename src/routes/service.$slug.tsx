import { createFileRoute, Link, Navigate, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type ComponentType } from "react";
import {
  ArrowLeft, Smartphone, Wifi, Receipt, Trophy, Zap, Tv,
  Banknote, PiggyBank, TrendingUp, Shield, Gift, Bitcoin,
  GraduationCap, Plane, ShoppingBag, Check, CreditCard, Wallet, User, Send,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { isValidMpayForTx, isGeneratedCode, formatNGN, useBalance, useTxs, genRef, addNotification } from "@/lib/store";

type Svc = {
  title: string;
  tagline: string;
  icon: ComponentType<{ className?: string }>;
  fields: { name: string; label: string; placeholder: string; type?: string }[];
  cta: string;
  presets?: string[];
  requiresMpay?: boolean;
};

const SERVICES: Record<string, Svc> = {
  airtime: { title: "Buy Airtime", tagline: "Top up any network instantly", icon: Smartphone,
    fields: [
      { name: "phone", label: "Phone Number", placeholder: "0801 234 5678", type: "tel" },
      { name: "network", label: "Network", placeholder: "MTN / Airtel / Glo / 9mobile" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], presets: ["100", "200", "500", "1000", "2000", "5000"], cta: "Buy Airtime", requiresMpay: true },
  data: { title: "Buy Data Bundle", tagline: "Stay connected on your favorite network", icon: Wifi,
    fields: [
      { name: "phone", label: "Phone Number", placeholder: "0801 234 5678", type: "tel" },
      { name: "network", label: "Network", placeholder: "MTN / Airtel / Glo / 9mobile" },
      { name: "plan", label: "Data Plan", placeholder: "1GB / 2GB / 5GB" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Buy Data", requiresMpay: true },
  "pay-bills": { title: "Pay Bills", tagline: "Settle all your utility bills in seconds", icon: Receipt,
    fields: [
      { name: "biller", label: "Biller", placeholder: "Select biller" },
      { name: "ref", label: "Customer Ref", placeholder: "Account / Meter no." },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Pay Bill", requiresMpay: true },
  betting: { title: "Fund Betting Wallet", tagline: "Top up your favorite betting account", icon: Trophy,
    fields: [
      { name: "platform", label: "Platform", placeholder: "Bet9ja / SportyBet / 1xBet" },
      { name: "userid", label: "Bet User ID", placeholder: "Your bet ID" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Fund Wallet", requiresMpay: true },
  electricity: { title: "Buy Electricity", tagline: "Prepaid & postpaid meters, all DISCOs", icon: Zap,
    fields: [
      { name: "disco", label: "Disco", placeholder: "EKEDC / IKEDC / AEDC" },
      { name: "meter", label: "Meter Number", placeholder: "Meter no.", type: "tel" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Buy Token", requiresMpay: true },
  "cable-tv": { title: "Cable TV Subscription", tagline: "Renew DSTV, GOTV & Startimes", icon: Tv,
    fields: [
      { name: "provider", label: "Provider", placeholder: "DSTV / GOTV / Startimes" },
      { name: "smartcard", label: "Smartcard / IUC", placeholder: "Smartcard no." },
      { name: "plan", label: "Plan", placeholder: "Compact / Premium" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Subscribe", requiresMpay: true },
  loans: { title: "Quick Loans", tagline: "Borrow up to ₦5,000,000 in minutes", icon: Banknote,
    fields: [
      { name: "amount", label: "Loan Amount (₦)", placeholder: "0.00", type: "tel" },
      { name: "tenure", label: "Tenure (months)", placeholder: "3 / 6 / 12", type: "tel" },
    ], cta: "Request Loan", requiresMpay: true },
  savings: { title: "Savings Plan", tagline: "Grow your money with up to 15% p.a.", icon: PiggyBank,
    fields: [
      { name: "goal", label: "Savings Goal", placeholder: "e.g. New Laptop" },
      { name: "amount", label: "Target (₦)", placeholder: "0.00", type: "tel" },
      { name: "freq", label: "Frequency", placeholder: "Daily / Weekly / Monthly" },
    ], cta: "Start Saving", requiresMpay: true },
  investment: { title: "Investments", tagline: "T-Bills, Mutual Funds & Eurobonds", icon: TrendingUp,
    fields: [
      { name: "product", label: "Product", placeholder: "T-Bill / Mutual Fund" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Invest Now", requiresMpay: true },
  insurance: { title: "Insurance", tagline: "Health, life & motor cover plans", icon: Shield,
    fields: [
      { name: "type", label: "Cover Type", placeholder: "Health / Motor / Life" },
      { name: "duration", label: "Duration", placeholder: "1 year" },
    ], cta: "Get Covered", requiresMpay: true },
  "gift-cards": { title: "Gift Cards", tagline: "Buy & redeem global gift cards", icon: Gift,
    fields: [
      { name: "brand", label: "Brand", placeholder: "Amazon / iTunes / Steam" },
      { name: "amount", label: "Value (USD)", placeholder: "0.00", type: "tel" },
    ], cta: "Buy Gift Card", requiresMpay: true },
  crypto: { title: "Crypto", tagline: "Buy, sell & swap digital assets", icon: Bitcoin,
    fields: [
      { name: "asset", label: "Asset", placeholder: "BTC / ETH / USDT" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Trade Crypto", requiresMpay: true },
  education: { title: "Education", tagline: "Pay school fees & exam pins", icon: GraduationCap,
    fields: [
      { name: "exam", label: "Exam Body", placeholder: "WAEC / NECO / JAMB" },
      { name: "qty", label: "Quantity", placeholder: "1", type: "tel" },
    ], cta: "Purchase Pin", requiresMpay: true },
  flights: { title: "Book Flights", tagline: "Local & international tickets", icon: Plane,
    fields: [
      { name: "from", label: "From", placeholder: "Lagos" },
      { name: "to", label: "To", placeholder: "Abuja" },
      { name: "date", label: "Departure", placeholder: "YYYY-MM-DD", type: "date" },
    ], cta: "Search Flights", requiresMpay: true },
  shopping: { title: "Shopping", tagline: "Pay merchants directly from your wallet", icon: ShoppingBag,
    fields: [
      { name: "merchant", label: "Merchant", placeholder: "Store name" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Pay Merchant", requiresMpay: true },
  withdraw: { title: "Withdraw", tagline: "Withdraw funds to your bank account", icon: Wallet,
    fields: [
      { name: "bank", label: "Bank", placeholder: "Bank name" },
      { name: "account", label: "Account Number", placeholder: "10-digit", type: "tel" },
      { name: "amount", label: "Amount (₦)", placeholder: "0.00", type: "tel" },
    ], cta: "Withdraw", requiresMpay: true },
  card: { title: "Cards", tagline: "Manage your virtual & physical cards", icon: CreditCard,
    fields: [
      { name: "type", label: "Card Type", placeholder: "Virtual / Physical" },
    ], cta: "Request Card" },
  wallet: { title: "Wallet", tagline: "View and manage your wallet", icon: Wallet,
    fields: [
      { name: "action", label: "Action", placeholder: "Top up / View" },
    ], cta: "Continue" },
  profile: { title: "Profile", tagline: "Manage your account & settings", icon: User,
    fields: [
      { name: "field", label: "Setting", placeholder: "Update profile" },
    ], cta: "Save" },
  payments: { title: "Payments", tagline: "All your payment options", icon: Send,
    fields: [
      { name: "type", label: "Type", placeholder: "Send / Receive" },
    ], cta: "Continue" },
};

const REDIRECTS: Record<string, string> = {
  "buy-mpay-id": "/buy-mpay",
  transfer: "/transfer",
  support: "/support",
  "earn-more": "/earn-more",
  notifications: "/notifications",
};

export const Route = createFileRoute("/service/$slug")({
  head: ({ params }) => {
    const svc = SERVICES[params.slug];
    return { meta: [
      { title: `${svc?.title ?? "Service"} — Moniepoint Pay` },
      { name: "description", content: svc?.tagline ?? "Moniepoint Pay service." },
    ]};
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
  const [mpayError, setMpayError] = useState("");
  const [done, setDone] = useState(false);

  if (REDIRECTS[slug]) return <Navigate to={REDIRECTS[slug] as "/buy-mpay"} />;

  if (!svc) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 bg-background">
          <p className="text-sm text-muted-foreground">Service not found.</p>
          <Link to="/dashboard" className="text-sm font-semibold underline text-primary">Back to dashboard</Link>
        </div>
      </PhoneFrame>
    );
  }

  const Icon = svc.icon;

  const onMpayChange = (v: string) => {
    setMpayCode(v);
    if (!v) { setMpayError(""); return; }
    if (isGeneratedCode(v)) setMpayError("Invalid MPAY ID CODE");
    else setMpayError("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (svc.requiresMpay) {
      if (!mpayCode) { setError("Please enter your MPAY ID CODE"); return; }
      if (!isValidMpayForTx(mpayCode)) { setMpayError("Invalid MPAY ID CODE"); return; }
    }

    const amt = Number(values.amount);
    const ref = genRef();
    const dateISO = new Date().toISOString();
    if (amt && amt > 0) {
      if (amt > balance) { setError("Insufficient balance"); return; }
      addTx({ id: ref, kind: "purchase", name: svc.title, sub: values.phone || values.meter || values.smartcard || values.ref || svc.title, amount: -amt, reference: ref, dateISO });
      addNotification({ id: ref, title: `${svc.title} Successful`, sub: values.phone || values.meter || values.smartcard || values.ref || svc.title, amount: -amt, status: "Successful", dateISO });
      setBalance(Math.max(0, balance - amt));
    } else {
      addNotification({ id: ref, title: `${svc.title} Request`, sub: svc.tagline, amount: 0, status: "Successful", dateISO });
    }
    setDone(true);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col bg-background text-foreground">
        <div className="relative px-6 pt-10 pb-6 overflow-hidden brand-gradient text-white">
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
          <div className="mt-3 rounded-xl bg-white/15 backdrop-blur p-2.5 flex items-center justify-between border border-white/20">
            <span className="text-[10px] uppercase tracking-widest opacity-90">Balance</span>
            <span className="text-sm font-black">{formatNGN(balance)}</span>
          </div>
        </div>

        <div className="flex-1 px-6 pt-5 pb-8">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center gap-3 pt-12">
              <div className="h-16 w-16 rounded-full brand-gradient flex items-center justify-center">
                <Check className="h-8 w-8 text-white" strokeWidth={3} />
              </div>
              <p className="text-base font-bold">Successful</p>
              <p className="text-xs text-muted-foreground max-w-[240px]">Your {svc.title.toLowerCase()} request was completed.</p>
              <Link to="/dashboard" className="mt-4 h-11 px-6 rounded-2xl text-sm font-semibold flex items-center justify-center brand-gradient text-white">
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
                      <button key={p} type="button" onClick={() => setValues((v) => ({ ...v, amount: p }))}
                        className="h-10 rounded-xl border border-border text-xs font-semibold hover:bg-brand-soft hover:text-primary hover:border-primary transition-colors">
                        ₦{p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {svc.fields.map((f) => (
                <div key={f.name}>
                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 block uppercase tracking-widest">{f.label}</label>
                  <input type={f.type ?? "text"} value={values[f.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full h-11 rounded-xl bg-card border border-border text-foreground px-3 text-sm font-medium outline-none focus:border-primary" />
                </div>
              ))}

              {svc.requiresMpay && (
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 block uppercase tracking-widest">MPAY ID CODE</label>
                  <input value={mpayCode} onChange={(e) => onMpayChange(e.target.value)}
                    placeholder="Enter your MPAY ID CODE"
                    className="w-full h-11 rounded-xl bg-card border border-border text-foreground px-3 text-sm font-medium outline-none focus:border-primary" />
                  {mpayError && <p className="mt-1 text-[11px] font-semibold text-destructive">{mpayError}</p>}
                </div>
              )}

              {error && <p className="text-[11px] font-semibold text-destructive">{error}</p>}

              <motion.button whileTap={{ scale: 0.97 }} type="submit"
                className="w-full h-12 rounded-2xl text-sm font-bold mt-2 brand-gradient text-white">
                {svc.cta}
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}

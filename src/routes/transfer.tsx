import { createFileRoute, useRouter, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Search, Eye, EyeOff, Check, Loader2, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { NIGERIAN_BANKS } from "@/lib/banks";
import { MPAY_ID_CODE, formatNGN, useBalance, useTxs, genRef } from "@/lib/store";

export const Route = createFileRoute("/transfer")({
  head: () => ({ meta: [{ title: "Transfer — Moniepoint Pay" }] }),
  component: TransferPage,
});

type Step = "form" | "confirm" | "sending" | "success";

function TransferPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { balance, setBalance } = useBalance();
  const { addTx } = useTxs();

  const [step, setStep] = useState<Step>("form");
  const [hidden, setHidden] = useState(false);
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [bankQuery, setBankQuery] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [amount, setAmount] = useState("");
  const [mpayCode, setMpayCode] = useState("");
  const [error, setError] = useState("");
  const [tx, setTx] = useState<{ ref: string; dateISO: string } | null>(null);

  const filteredBanks = useMemo(() => {
    const q = bankQuery.trim().toLowerCase();
    if (!q) return NIGERIAN_BANKS;
    return NIGERIAN_BANKS.filter((b) => b.toLowerCase().startsWith(q));
  }, [bankQuery]);

  const validate = () => {
    setError("");
    if (!name || !accountNumber || !bank || !amount || !mpayCode) {
      setError("Please fill in all fields");
      return false;
    }
    if (mpayCode !== MPAY_ID_CODE) {
      setError("Incorrect MPAY ID CODE");
      return false;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount");
      return false;
    }
    if (amt > balance) {
      setError("Insufficient balance");
      return false;
    }
    return true;
  };

  const proceed = () => {
    if (!validate()) return;
    setStep("confirm");
  };

  const doSend = () => {
    setStep("sending");
    setTimeout(() => {
      const amt = Number(amount);
      const ref = genRef();
      const dateISO = new Date().toISOString();
      addTx({
        id: ref,
        kind: "transfer",
        name,
        sub: `${bank} · ${accountNumber}`,
        amount: -amt,
        bank,
        account: accountNumber,
        reference: ref,
        dateISO,
      });
      setBalance(Math.max(0, balance - amt));
      setTx({ ref, dateISO });
      setStep("success");
    }, 1800);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col">
        <div className="px-6 pt-10 pb-5 text-white relative overflow-hidden brand-gradient">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="flex items-center justify-between">
            <button onClick={() => (step === "form" ? router.history.back() : setStep("form"))} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <h1 className="mt-3 text-lg font-black tracking-tight">Transfer Money</h1>
          <div className="mt-3 rounded-2xl bg-white/15 backdrop-blur p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Available Balance</p>
              <p className="text-base font-black mt-0.5">{hidden ? "₦••••••" : formatNGN(balance)}</p>
            </div>
            <button onClick={() => setHidden((h) => !h)} className="opacity-90">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 py-5">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                <Input label="Recipient Account Name" value={name} onChange={setName} placeholder="John Doe" />
                <Input label="Recipient Account Number" value={accountNumber} onChange={(v) => setAccountNumber(v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit account" type="tel" />

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1 block">Search or Select Bank</label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={showBankList ? bankQuery : (bank || bankQuery)}
                      onFocus={() => { setShowBankList(true); setBankQuery(bank); setBank(""); }}
                      onChange={(e) => setBankQuery(e.target.value)}
                      placeholder="Type to search banks..."
                      className="w-full h-11 rounded-xl border border-border bg-muted pl-10 pr-3 text-sm font-medium outline-none focus:border-primary focus:bg-white"
                    />
                  </div>
                  {showBankList && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
                      {filteredBanks.length === 0 && <p className="text-xs text-muted-foreground p-3 text-center">No banks match "{bankQuery}"</p>}
                      {filteredBanks.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => { setBank(b); setBankQuery(""); setShowBankList(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-soft transition-colors border-b border-border last:border-0"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Input label="Amount (₦)" value={amount} onChange={(v) => setAmount(v.replace(/[^\d.]/g, ""))} placeholder="0.00" type="tel" />
                <Input label="MPAY ID CODE" value={mpayCode} onChange={setMpayCode} placeholder="Enter your MPAY ID CODE" />

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

                <motion.button whileTap={{ scale: 0.97 }} onClick={proceed} className="w-full h-12 rounded-2xl text-white text-sm font-bold brand-gradient mt-2">
                  CONTINUE
                </motion.button>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Confirm Transfer</p>
                <div className="rounded-2xl bg-card border border-border p-4 space-y-3" style={{ boxShadow: "var(--shadow-card)" }}>
                  <Row label="Recipient Name" value={name} />
                  <Row label="Account Number" value={accountNumber} />
                  <Row label="Bank Name" value={bank} />
                  <Row label="Amount" value={formatNGN(Number(amount))} highlight />
                  <Row label="Date" value={new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" })} />
                  <Row label="Time" value={new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button onClick={() => setStep("form")} className="h-12 rounded-2xl border border-border text-sm font-bold">EDIT</button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={doSend} className="h-12 rounded-2xl text-white text-sm font-bold brand-gradient">PROCEED</motion.button>
                </div>
              </motion.div>
            )}

            {step === "sending" && (
              <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center gap-4 pt-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="h-14 w-14 text-primary" />
                </motion.div>
                <p className="text-lg font-black">Sending...</p>
                <p className="text-xs text-muted-foreground">Please wait...</p>
              </motion.div>
            )}

            {step === "success" && tx && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto h-20 w-20 rounded-full flex items-center justify-center"
                  style={{ background: "#16A34A" }}
                >
                  <Check className="h-10 w-10 text-white" strokeWidth={3} />
                </motion.div>
                <h2 className="mt-4 text-xl font-black tracking-tight">Transfer Successful</h2>
                <p className="text-xs text-muted-foreground">Your money is on its way</p>

                <div className="mt-5 rounded-2xl bg-card border border-border p-4 space-y-2.5 text-left" style={{ boxShadow: "var(--shadow-card)" }}>
                  <Row label="Recipient Name" value={name} />
                  <Row label="Account Number" value={accountNumber} />
                  <Row label="Bank Name" value={bank} />
                  <Row label="Amount" value={formatNGN(Number(amount))} highlight />
                  <Row label="Date" value={new Date(tx.dateISO).toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" })} />
                  <Row label="Time" value={new Date(tx.dateISO).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })} />
                  <Row label="Month" value={new Date(tx.dateISO).toLocaleString("en-NG", { month: "long" })} />
                  <Row label="Year" value={String(new Date(tx.dateISO).getFullYear())} />
                  <Row label="Transaction Ref" value={tx.ref} />
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Status</span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full text-white" style={{ background: "#16A34A" }}>SUCCESSFUL</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button className="h-12 rounded-2xl border border-border text-sm font-bold flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <button onClick={() => navigate({ to: "/dashboard" })} className="h-12 rounded-2xl text-white text-sm font-bold brand-gradient">
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-border bg-muted px-3 text-sm font-medium outline-none focus:border-primary focus:bg-white"
      />
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold text-right ${highlight ? "text-primary text-base" : ""}`}>{value}</span>
    </div>
  );
}

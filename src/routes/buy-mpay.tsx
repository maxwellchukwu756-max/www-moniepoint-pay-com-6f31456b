import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, Upload, Check, IdCard, Copy } from "lucide-react";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAccount, formatNGN, useTxs, useBalance, genRef } from "@/lib/store";

export const Route = createFileRoute("/buy-mpay")({
  head: () => ({ meta: [{ title: "Buy MPAY ID — Moniepoint Pay" }] }),
  component: BuyMpay,
});

const PRICE = 10250;

type Step = "info" | "warning" | "payment" | "done";

function BuyMpay() {
  const router = useRouter();
  const navigate = useNavigate();
  const account = useAccount();
  const { addTx } = useTxs();
  const { balance, setBalance } = useBalance();
  const [step, setStep] = useState<Step>("info");
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from account once
  if (account && !fullName && !phone && !email) {
    setFullName(account.fullName);
    setPhone(account.phone);
    setEmail(account.email);
  }

  const confirmPayment = () => {
    setSubmitting(true);
    setTimeout(() => {
      addTx({
        id: genRef(),
        kind: "purchase",
        name: "MPAY ID Purchase",
        sub: "Moniepoint MFB",
        amount: -PRICE,
        reference: genRef(),
        dateISO: new Date().toISOString(),
      });
      setBalance(Math.max(0, balance - PRICE));
      setStep("done");
      setSubmitting(false);
    }, 1500);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col">
        <div className="px-6 pt-10 pb-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#6D28D9 0%,#4338CA 100%)" }}>
          <button onClick={() => router.history.back()} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <IdCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Buy MPAY ID</h1>
              <p className="text-[11px] opacity-90">Your unique Moniepoint Pay identity</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-5">
          <AnimatePresence mode="wait">
            {step === "info" && (
              <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="rounded-2xl bg-brand-soft p-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Price</p>
                  <p className="mt-1 text-2xl font-black" style={{ color: "#0000FF" }}>{formatNGN(PRICE)}</p>
                </div>

                <p className="mt-5 text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Buyer Details</p>
                <div className="space-y-3">
                  <Field label="Full Name" value={fullName} onChange={setFullName} editing={editing} />
                  <Field label="Phone Number" value={phone} onChange={setPhone} editing={editing} />
                  <Field label="Email Address" value={email} onChange={setEmail} editing={editing} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditing((e) => !e)}
                    className="h-12 rounded-2xl border border-border text-sm font-bold"
                  >
                    {editing ? "DONE" : "EDIT"}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep("warning")}
                    className="h-12 rounded-2xl text-white text-sm font-bold brand-gradient"
                  >
                    NEXT
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === "warning" && (
              <motion.div key="warning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center pt-4">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="mx-auto h-20 w-20 rounded-full flex items-center justify-center"
                  style={{ background: "#FEF3C7" }}
                >
                  <AlertTriangle className="h-10 w-10" style={{ color: "#D97706" }} />
                </motion.div>
                <h2 className="mt-4 text-xl font-black tracking-tight" style={{ color: "#D97706" }}>WARNING</h2>
                <p className="mt-3 text-sm font-semibold">Never use OPAY or PALMPAY Bank for MPAY ID Code purchase.</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Using OPAY or PALMPAY may cause your payment to decline.
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Use other Nigerian Banks for successful payment.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("payment")}
                  className="mt-6 w-full h-12 rounded-2xl text-white text-sm font-bold brand-gradient"
                >
                  OK
                </motion.button>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Transfer to</p>
                <div className="rounded-2xl bg-card border border-border p-4 space-y-3" style={{ boxShadow: "var(--shadow-card)" }}>
                  <DetailRow label="Account Name" value="Mod.., Chi.., Agb..." />
                  <DetailRow label="Account Number" value="6711230988" copy />
                  <DetailRow label="Bank" value="Moniepoint MFB" />
                  <DetailRow label="Amount" value={formatNGN(PRICE)} />
                </div>

                <label className="mt-5 block">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Upload Payment Receipt</p>
                  <div className="rounded-2xl border-2 border-dashed border-border bg-muted/50 p-5 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-xs mt-2 font-medium">{receipt ?? "Tap to upload receipt"}</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setReceipt(e.target.files?.[0]?.name ?? null)}
                    />
                  </div>
                </label>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={submitting}
                  onClick={confirmPayment}
                  className="mt-5 w-full h-12 rounded-2xl text-white text-sm font-bold brand-gradient disabled:opacity-60"
                >
                  {submitting ? "Confirming..." : "CONFIRM MY PAYMENT"}
                </motion.button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-8">
                <div className="mx-auto h-20 w-20 rounded-full brand-gradient flex items-center justify-center">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h2 className="mt-4 text-xl font-black tracking-tight">Payment Confirmed</h2>
                <p className="mt-2 text-xs text-muted-foreground">We're processing your MPAY ID. You'll receive a notification shortly.</p>
                <button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="mt-6 w-full h-12 rounded-2xl text-white text-sm font-bold brand-gradient"
                >
                  Back to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Field({ label, value, onChange, editing }: { label: string; value: string; onChange: (v: string) => void; editing: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">{label}</p>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 rounded-xl border border-primary bg-white px-3 text-sm font-medium outline-none"
        />
      ) : (
        <div className="h-11 rounded-xl bg-muted px-3 flex items-center text-sm font-semibold">{value || "—"}</div>
      )}
    </div>
  );
}

function DetailRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">{label}</p>
        <p className="text-sm font-bold mt-0.5">{value}</p>
      </div>
      {copy && (
        <button
          onClick={() => {
            navigator.clipboard?.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="h-8 px-3 rounded-lg bg-brand-soft text-primary text-[11px] font-bold flex items-center gap-1"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}

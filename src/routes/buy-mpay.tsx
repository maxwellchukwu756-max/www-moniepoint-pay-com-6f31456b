import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, Upload, Check, IdCard, Copy, MessageCircle, Headphones } from "lucide-react";
import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAccount, formatNGN, useBalance, generateMpayCode, updateCurrentAccount, WHATSAPP_GROUP, WHATSAPP_SUPPORT } from "@/lib/store";

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
  const { balance, setBalance } = useBalance();
  const [step, setStep] = useState<Step>("info");
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (account && !fullName && !phone && !email) {
      setFullName(account.fullName);
      setPhone(account.phone);
      setEmail(account.email);
    }
  }, [account, fullName, phone, email]);

  const confirmPayment = () => {
    setSubmitting(true);
    setTimeout(() => {
      const code = account ? generateMpayCode(account) : `MPAY%_ID${Math.floor(100 + Math.random() * 900)}_CODE_${Math.floor(1000 + Math.random() * 9000)}`;
      if (account) updateCurrentAccount({ generatedCode: code });
      setGeneratedCode(code);
      setBalance(Math.max(0, balance - PRICE));
      setStep("done");
      setSubmitting(false);
    }, 1500);
  };

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(generatedCode); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col bg-background text-foreground">
        <div className="px-6 pt-10 pb-6 relative overflow-hidden brand-gradient text-white">
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
                <div className="rounded-2xl brand-gradient text-white p-4 text-center" style={{ boxShadow: "var(--shadow-float)" }}>
                  <p className="text-[11px] uppercase tracking-widest font-semibold opacity-80">Price</p>
                  <p className="mt-1 text-2xl font-black">{formatNGN(PRICE)}</p>
                </div>

                <p className="mt-5 text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Buyer Details</p>
                <div className="space-y-3">
                  <Field label="Full Name" value={fullName} onChange={setFullName} editing={editing} />
                  <Field label="Phone Number" value={phone} onChange={setPhone} editing={editing} />
                  <Field label="Email Address" value={email} onChange={setEmail} editing={editing} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button onClick={() => setEditing((e) => !e)} className="h-12 rounded-2xl border border-border text-sm font-bold">
                    {editing ? "DONE" : "EDIT"}
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep("warning")} className="h-12 rounded-2xl text-sm font-bold brand-gradient text-white">
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
                <h2 className="mt-4 text-xl font-black tracking-tight">WARNING</h2>
                <p className="mt-3 text-sm font-semibold">Never use OPAY or PALMPAY Bank for MPAY ID Code purchase.</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">Using OPAY or PALMPAY may cause your payment to decline.</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">Use other Nigerian Banks for successful payment.</p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep("payment")} className="mt-6 w-full h-12 rounded-2xl text-sm font-bold brand-gradient text-white">
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
                  <div className="rounded-2xl border-2 border-dashed border-border bg-muted p-5 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-6 w-6 mx-auto text-primary" />
                    <p className="text-xs mt-2 font-medium">{receipt ?? "Tap to upload receipt"}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setReceipt(e.target.files?.[0]?.name ?? null)} />
                  </div>
                </label>

                <motion.button whileTap={{ scale: 0.97 }} disabled={submitting} onClick={confirmPayment} className="mt-5 w-full h-12 rounded-2xl text-sm font-bold disabled:opacity-60 brand-gradient text-white">
                  {submitting ? "Confirming..." : "CONFIRM MY PAYMENT"}
                </motion.button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-4">
                <div className="mx-auto h-16 w-16 rounded-full brand-gradient flex items-center justify-center">
                  <Check className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
                <h2 className="mt-3 text-lg font-black tracking-tight">Payment Successful</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Your unique MPAY ID CODE has been generated.</p>

                <div className="mt-5 rounded-2xl bg-brand-soft border border-border p-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Your MPAY ID CODE</p>
                  <p className="mt-2 text-base font-black break-all select-all text-primary">{generatedCode}</p>
                </div>

                <p className="mt-4 text-xs font-semibold">Contact Customer Service Support Team for Activation.</p>

                <div className="mt-5 space-y-2.5">
                  <button onClick={copyCode} className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold brand-gradient text-white">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "COPIED" : "COPY MPAY ID CODE"}
                  </button>
                  <button onClick={() => navigate({ to: "/support" })} className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold border border-border">
                    <Headphones className="h-4 w-4" /> CONTACT SUPPORT
                  </button>
                  <a href={WHATSAPP_GROUP} target="_blank" rel="noreferrer" className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white" style={{ background: "#25D366" }}>
                    <MessageCircle className="h-4 w-4" /> WHATSAPP SUPPORT
                  </a>
                  <a href={WHATSAPP_SUPPORT} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground underline block mt-1">Or chat 1-on-1 on WhatsApp</a>
                </div>

                <button onClick={() => navigate({ to: "/dashboard" })} className="mt-5 w-full h-11 rounded-2xl text-sm font-bold border border-border">
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
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-11 rounded-xl bg-card border border-border text-foreground px-3 text-sm font-medium outline-none focus:border-primary" />
      ) : (
        <div className="h-11 rounded-xl bg-card border border-border px-3 flex items-center text-sm font-semibold">{value || "—"}</div>
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
          className="h-8 px-3 rounded-lg brand-gradient text-white text-[11px] font-bold flex items-center gap-1"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}

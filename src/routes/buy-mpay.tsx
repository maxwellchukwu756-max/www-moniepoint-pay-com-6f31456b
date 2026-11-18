import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, Upload, Check, IdCard, Copy, Headphones, ShieldCheck, Clock3, LockKeyhole, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TelegramIcon } from "@/components/TelegramIcon";
import { useAccount, formatNGN, TELEGRAM_CHANNEL } from "@/lib/store";
import { Button } from "@/components/ui/button";
import bankWarningAsset from "@/assets/bank-warning.png.asset.json";

export const Route = createFileRoute("/buy-mpay")({
  head: () => ({
    meta: [
      { title: "Buy MPAY ID — Moniepoint Pay" },
      { name: "description", content: "Review your Moniepoint Pay MPAY ID purchase status." },
      { property: "og:title", content: "Buy MPAY ID — Moniepoint Pay" },
      { property: "og:description", content: "Review your Moniepoint Pay MPAY ID purchase status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuyMpay,
});

const PRICE = 10780;

type Step = "info" | "warning" | "payment" | "done";

function BuyMpay() {
  const router = useRouter();
  const navigate = useNavigate();
  const account = useAccount();
  const [step, setStep] = useState<Step>("info");
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      setStep("done");
      setSubmitting(false);
    }, 1500);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col bg-background text-foreground">
        {step !== "done" && <div className="px-6 pt-10 pb-6 relative overflow-hidden brand-gradient text-white">
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
        </div>}

        <div className={step === "done" ? "flex-1" : "flex-1 px-6 py-5"}>
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
              <motion.div key="warning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pt-2">
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-center">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -8, 0] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                    className="mx-auto h-20 w-20 rounded-full flex items-center justify-center bg-amber-100"
                  >
                    <AlertTriangle className="h-10 w-10 text-amber-600" />
                  </motion.div>

                  <h2 className="mt-4 text-xl font-black tracking-tight text-amber-700">Payment Notice</h2>

                  <div className="mt-4 rounded-xl bg-white border border-amber-100 p-4 shadow-sm">
                    <img
                      src={bankWarningAsset.url}
                      alt="Supported bank reference"
                      className="mx-auto h-24 w-24 object-contain rounded-2xl"
                    />
                    <p className="mt-3 text-xs font-semibold text-amber-700">Use any Nigerian bank for your payment</p>
                  </div>

                  <div className="mt-4 space-y-2 text-left">
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700">OPAY & PalmPay MFB are not accepted</p>
                        <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">
                          Payments sent from OPAY or PalmPay MFB may not be recognized and could cause delays or failed activation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 p-3">
                      <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-700">Other banks are welcome</p>
                        <p className="text-[11px] text-green-600 mt-0.5 leading-relaxed">
                          You can safely complete your purchase using GTBank, First Bank, UBA, Zenith, Moniepoint MFB, Access Bank, Kuda, or any other Nigerian bank.
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep("payment")} className="mt-6 w-full h-12 rounded-2xl text-sm font-bold brand-gradient text-white">
                    I UNDERSTAND, CONTINUE
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Transfer to</p>
                <div className="rounded-2xl bg-card border border-border p-4 space-y-3" style={{ boxShadow: "var(--shadow-card)" }}>
                  <DetailRow label="Account Name" value="CH.. MA.." />
                  <DetailRow label="Account Number" value="0150934472" copy />
                  <DetailRow label="Bank" value="Sterling Bank" />
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
              <motion.section key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-full flex-col">
                <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-review-navy px-5 py-4 text-primary-foreground">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-foreground/10">
                      <IdCard className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">MONIEPOINT PAY</p>
                      <p className="text-xs opacity-80">MPAY ID PURCHASE</p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-review-green/15 px-3 py-1.5 text-xs font-semibold text-review-green">
                    <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Secure
                  </span>
                </header>

                <div className="flex flex-1 flex-col bg-muted px-4 py-4 sm:px-5">
                  <div className="mx-auto flex w-full max-w-sm flex-1 flex-col rounded-3xl border border-border bg-background p-5 shadow-[var(--shadow-card)] sm:p-6">
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        animate={{ scale: [1, 1.045, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="grid h-20 w-20 place-items-center rounded-full bg-review-green-soft text-review-green"
                      >
                        <Clock3 className="h-10 w-10" strokeWidth={2.2} aria-hidden="true" />
                      </motion.div>
                      <h2 className="mt-4 text-xl font-bold text-review-navy">Payment Under Review</h2>
                      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                        Your MPAY ID purchase request is awaiting payment verification.
                      </p>
                      <span className="mt-3 rounded-full bg-review-amber-soft px-3 py-1.5 text-xs font-semibold text-review-amber">
                        PENDING REVIEW
                      </span>
                    </div>

                    <div className="my-5 border-t border-border" />

                    <div className="rounded-2xl bg-review-green-soft p-4">
                      <h3 className="text-base font-bold text-review-navy">What’s happening next?</h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        Our MONIEPOINT PAY payment verification agent will review your payment transaction.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        After successful verification, your personal MPAY ID CODE will be generated and made available in your account.
                      </p>
                    </div>

                    <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                      This app cannot send receipts to a verification agent yet. Contact support to complete manual review; no MPAY ID has been issued.
                    </p>

                    <div className="mt-auto space-y-2 pt-5">
                      <Button onClick={() => navigate({ to: "/dashboard" })} className="h-12 w-full rounded-xl bg-review-green text-primary-foreground hover:bg-review-green/90">
                        Back to Dashboard
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => navigate({ to: "/support" })} className="h-11 rounded-xl text-xs sm:text-sm">
                          <Headphones className="h-4 w-4" aria-hidden="true" /> Contact Support
                        </Button>
                        <Button asChild variant="outline" className="h-11 rounded-xl text-xs sm:text-sm">
                          <a href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer">
                            <TelegramIcon className="h-4 w-4" /> Join Telegram
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
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

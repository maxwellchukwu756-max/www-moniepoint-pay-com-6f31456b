import { createFileRoute, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Check, Copy, Share2, Users, Gift } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAccount, useBalance, useTxs, addNotification, formatNGN, genRef } from "@/lib/store";
import {
  getTodaysTasks,
  dayKey,
  COMPLETED_KEY,
  LAST_NOTIFIED_DAY_KEY,
  firePush,
} from "@/lib/earn";

export const Route = createFileRoute("/earn-more")({
  head: () => ({ meta: [{ title: "Earn More — Moniepoint Pay" }] }),
  component: EarnMore,
});

type CompletedMap = { _day?: string; [taskId: string]: boolean | string | undefined };


function EarnMore() {
  const router = useRouter();
  const account = useAccount();
  const { balance, setBalance } = useBalance();
  const { addTx } = useTxs();
  const [showReferral, setShowReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const tasks = useMemo(getTodaysTasks, []);
  const [completed, setCompleted] = useState<CompletedMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_KEY);
      const map: CompletedMap = raw ? JSON.parse(raw) : {};
      if (map._day !== dayKey()) {
        const fresh: CompletedMap = { _day: dayKey() };
        localStorage.setItem(COMPLETED_KEY, JSON.stringify(fresh));
        setCompleted(fresh);
      } else {
        setCompleted(map);
      }
      // Notify once per day that new tasks have unlocked
      const lastNotified = localStorage.getItem(LAST_NOTIFIED_DAY_KEY);
      if (lastNotified !== dayKey()) {
        localStorage.setItem(LAST_NOTIFIED_DAY_KEY, dayKey());
        addNotification({
          id: "earn-daily-" + dayKey(),
          title: "New Earn More Tasks",
          sub: "Fresh tasks are available — complete them to earn cash today.",
          amount: 0,
          status: "Successful",
          dateISO: new Date().toISOString(),
        });
        firePush("New Earn More Tasks", "Fresh tasks are available — complete them to earn cash today.");
      }
    } catch { setCompleted({ _day: dayKey() }); }
  }, []);

  const complete = (id: string, title: string, reward: number) => {
    if (completed[id]) return;
    const next: CompletedMap = { ...completed, [id]: true, _day: dayKey() };
    setCompleted(next);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(next));
    try { window.dispatchEvent(new Event("mp:earn")); } catch {}

    const ref = genRef();
    const dateISO = new Date().toISOString();
    // hidden: true keeps Earn More rewards OUT of dashboard "Recent Transactions"
    addTx({ id: ref, kind: "earn", name: "Earn More Reward", sub: title, amount: reward, reference: ref, dateISO, hidden: true });
    addNotification({ id: ref, title: "Earn More Reward", sub: title, amount: reward, status: "Successful", dateISO });
    setBalance(balance + reward);
    firePush("Task Completed", `${title} — you earned ${formatNGN(reward)}`);
  };


  const referralLink = account?.referralCode
    ? `https://moniepointpay.netlify.app/register?ref=${account.referralCode}`
    : "https://moniepointpay.netlify.app/register";

  const copy = async () => {
    try { await navigator.clipboard.writeText(referralLink); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Join Moniepoint Pay", url: referralLink }); } catch {}
    } else { copy(); }
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col bg-background text-foreground">
        <div className="px-6 pt-10 pb-6 brand-gradient text-white">
          <button onClick={() => router.history.back()} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Earn More</h1>
              <p className="text-[11px] opacity-90">Complete tasks & invite friends to earn cash</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-5 space-y-4">
          <button onClick={() => setShowReferral(s => !s)} className="w-full rounded-2xl bg-card border border-border p-4 flex items-center gap-3 text-left" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="h-10 w-10 rounded-xl bg-brand-soft flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black">Invite Users</p>
              <p className="text-[11px] text-muted-foreground">Earn ₦1,000 for each successful referral</p>
            </div>
            <span className="text-[10px] font-bold text-primary">{showReferral ? "HIDE" : "OPEN"}</span>
          </button>

          {showReferral && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Your Referral Link</p>
                <p className="mt-1 text-xs font-bold break-all select-all">{referralLink}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={copy} className="h-11 rounded-xl brand-gradient text-white text-xs font-bold flex items-center justify-center gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
                <button onClick={share} className="h-11 rounded-xl border border-border text-xs font-bold flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <Stat label="Referral Count" value="0" />
                <Stat label="Successful" value="0" />
                <Stat label="Earnings" value="₦0.00" />
                <Stat label="Pending" value="0" />
              </div>
            </motion.div>
          )}

          <div>
            <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5" /> Today's Tasks
            </p>
            <div className="space-y-2.5">
              {tasks.map(t => {
                const done = completed[t.id] === true;
                return (
                  <div key={t.id} className="rounded-2xl bg-card border border-border p-3.5 flex items-center gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="h-10 w-10 rounded-xl bg-brand-soft flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground">Reward: {formatNGN(t.reward)}</p>
                    </div>
                    <button
                      disabled={done}
                      onClick={() => complete(t.id, t.title, t.reward)}
                      className={`h-9 px-3 rounded-xl text-[11px] font-black ${done ? "bg-muted text-muted-foreground" : "brand-gradient text-white"}`}
                    >
                      {done ? "DONE" : "EARN"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-2.5">
      <p className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-black mt-0.5">{value}</p>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useSpin, SPIN_REWARDS, addRewardHistory, unlockBadge } from "@/lib/rewards";
import { useBalance, formatNGN } from "@/lib/store";

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function SpinWheel() {
  const { ready, msUntil, spin } = useSpin();
  const { balance, setBalance } = useBalance();
  const [rotate, setRotate] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (ready) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [ready, now]);

  const doSpin = () => {
    const amt = spin();
    if (amt === null) return;
    setSpinning(true);
    const idx = SPIN_REWARDS.indexOf(amt);
    const segAngle = 360 / SPIN_REWARDS.length;
    const target = 360 * 6 + (360 - idx * segAngle - segAngle / 2);
    setRotate(target);
    setTimeout(() => {
      setBalance(balance + amt);
      addRewardHistory({ kind: "spin", title: `Spin & Win`, amount: amt });
      const u = unlockBadge("task_champion");
      if (u.unlocked) {
        setBalance(balance + amt + u.reward);
        addRewardHistory({ kind: "badge", title: "Badge: Task Champion", amount: u.reward });
      }
      setResult(amt);
      setSpinning(false);
      setTimeout(() => setResult(null), 2600);
    }, 3800);
  };

  const seg = 360 / SPIN_REWARDS.length;

  return (
    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> Spin & Win</h3>
        {!ready && <span className="text-[10px] font-black text-muted-foreground">Next spin in {formatCountdown(msUntil - (now - Date.now()))}</span>}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="relative w-56 h-56">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-primary" />
          <motion.div
            animate={{ rotate }}
            transition={{ duration: spinning ? 3.6 : 0, ease: [0.17, 0.67, 0.24, 1] }}
            className="w-full h-full rounded-full border-4 border-primary relative overflow-hidden"
            style={{
              background: `conic-gradient(${SPIN_REWARDS.map((_, i) => {
                const c = ["#0000FF", "#6D28D9", "#16A34A", "#EA580C", "#DC2626", "#0891B2", "#CA8A04", "#DB2777"][i % 8];
                return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
              }).join(",")})`
            }}
          >
            {SPIN_REWARDS.map((amt, i) => {
              const angle = i * seg + seg / 2;
              return (
                <div key={i} className="absolute top-1/2 left-1/2 text-white text-[11px] font-black" style={{
                  transform: `rotate(${angle}deg) translateY(-80px) rotate(${-angle}deg)`,
                  transformOrigin: "0 0",
                }}>
                  ₦{amt}
                </div>
              );
            })}
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border-2 border-primary" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!ready || spinning}
          onClick={doSpin}
          className="mt-5 w-full h-11 rounded-xl brand-gradient text-white font-black text-xs disabled:opacity-60"
        >
          {spinning ? "SPINNING…" : ready ? "SPIN NOW" : `NEXT SPIN ${formatCountdown(msUntil)}`}
        </motion.button>
      </div>

      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-3xl p-8 text-center max-w-[320px]"
            >
              <Sparkles className="h-16 w-16 text-primary mx-auto" />
              <h3 className="mt-4 text-2xl font-black">You won {formatNGN(result)}!</h3>
              <p className="mt-1 text-xs text-muted-foreground">Added to your withdrawable balance.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

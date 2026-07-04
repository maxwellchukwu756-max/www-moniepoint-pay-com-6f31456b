import { motion, AnimatePresence } from "framer-motion";
import { Gift, Check, Flame } from "lucide-react";
import { useState } from "react";
import { useDailyReward, DAILY_REWARDS, DAILY_BONUS, addRewardHistory, unlockBadge } from "@/lib/rewards";
import { useBalance, formatNGN } from "@/lib/store";

export function DailyReward() {
  const { streak, claimedToday, nextDay, nextAmount, claim } = useDailyReward();
  const { balance, setBalance } = useBalance();
  const [popup, setPopup] = useState<{ amount: number; day: number } | null>(null);

  const doClaim = () => {
    const res = claim();
    if (!res) return;
    setBalance(balance + res.amount);
    addRewardHistory({ kind: "daily", title: `Day ${res.day} Daily Reward`, amount: res.amount });
    setPopup(res);
    // badge unlocks
    if (res.day >= 3) {
      const u = unlockBadge("active");
      if (u.unlocked) { setBalance((prev) => prev); addRewardHistory({ kind: "badge", title: "Badge: Active User", amount: u.reward }); setBalance(balance + res.amount + u.reward); }
    }
    if (res.day === 7) {
      const u = unlockBadge("vip");
      if (u.unlocked) { addRewardHistory({ kind: "badge", title: "Badge: VIP Member", amount: u.reward }); setBalance(balance + res.amount + u.reward); }
    }
    setTimeout(() => setPopup(null), 2600);
  };

  return (
    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-1.5"><Gift className="h-4 w-4 text-primary" /> Daily Reward</h3>
        <span className="text-[10px] font-black text-primary flex items-center gap-1"><Flame className="h-3 w-3" /> {streak}-day streak</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="grid grid-cols-7 gap-1.5">
          {DAILY_REWARDS.map((amt, i) => {
            const day = i + 1;
            const claimed = day <= streak;
            const isNext = day === nextDay && !claimedToday;
            return (
              <div key={day} className={`aspect-[3/4] rounded-lg flex flex-col items-center justify-center text-[9px] font-black relative ${claimed ? "brand-gradient text-white" : isNext ? "bg-brand-soft text-primary border-2 border-primary" : "bg-muted text-muted-foreground"}`}>
                <span className="opacity-70 text-[8px]">D{day}</span>
                <span>₦{amt}</span>
                {day === 7 && <span className="text-[7px] opacity-80">+bonus</span>}
                {claimed && <Check className="absolute top-0.5 right-0.5 h-2.5 w-2.5" />}
              </div>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={claimedToday}
          onClick={doClaim}
          className="mt-4 w-full h-11 rounded-xl brand-gradient text-white font-black text-xs disabled:opacity-60"
        >
          {claimedToday ? "✓ Claimed — Come back tomorrow" : `CLAIM ${formatNGN(nextAmount)}${nextDay === 7 ? " + BONUS" : ""}`}
        </motion.button>
      </div>

      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-3xl p-8 text-center max-w-[320px]"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: 2 }}>
                <Gift className="h-16 w-16 text-primary mx-auto" />
              </motion.div>
              <h3 className="mt-4 text-2xl font-black">+{formatNGN(popup.amount)}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Day {popup.day} reward added to your balance{popup.day === 7 ? " + ₦" + DAILY_BONUS + " bonus" : ""}!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

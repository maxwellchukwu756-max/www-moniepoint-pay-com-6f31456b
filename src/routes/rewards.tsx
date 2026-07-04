import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Gift, Sparkles, Trophy, Award, Star } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useRewardHistory, RewardKind } from "@/lib/rewards";
import { formatNGN } from "@/lib/store";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Reward History — Moniepoint Pay" }] }),
  component: Rewards,
});

const ICON: Record<RewardKind, any> = {
  daily: Gift, spin: Sparkles, leaderboard: Trophy, badge: Award, task: Star, bonus: Gift, referral: Trophy,
};

function Rewards() {
  const items = useRewardHistory();
  const total = items.reduce((a, b) => a + b.amount, 0);
  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col pb-8">
        <div className="px-6 pt-8 flex items-center gap-3">
          <Link to="/dashboard" className="h-9 w-9 rounded-full bg-brand-soft flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Link>
          <h1 className="text-lg font-black">Reward History</h1>
        </div>

        <div className="mx-6 mt-5 rounded-3xl brand-gradient text-white p-5" style={{ boxShadow: "var(--shadow-float)" }}>
          <p className="text-[10px] uppercase tracking-widest opacity-80">Total Rewards Earned</p>
          <h2 className="mt-1 text-2xl font-black">{formatNGN(total)}</h2>
          <p className="text-[11px] opacity-80 mt-1">{items.length} reward{items.length === 1 ? "" : "s"} added to your withdrawable balance</p>
        </div>

        <div className="px-6 mt-6 space-y-2">
          {items.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl py-10 text-center">
              <p className="text-sm font-semibold text-muted-foreground">No rewards yet</p>
              <p className="text-[11px] text-muted-foreground mt-1">Claim your daily reward, spin the wheel, or refer friends.</p>
            </div>
          ) : items.map(r => {
            const Icon = ICON[r.kind];
            return (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-3.5 flex items-center gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="h-10 w-10 rounded-xl bg-brand-soft flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{r.kind} reward · {new Date(r.dateISO).toLocaleString("en-NG", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="text-sm font-black text-green-600">+{formatNGN(r.amount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}

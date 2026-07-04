import { Trophy } from "lucide-react";
import { getLeaderboard, LEADERBOARD_REWARDS } from "@/lib/rewards";
import { formatNGN } from "@/lib/store";

export function Leaderboard() {
  const rows = getLeaderboard();
  return (
    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-1.5"><Trophy className="h-4 w-4 text-primary" /> Top 10 Referrers This Week</h3>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {rows.map((r, i) => {
          const reward = LEADERBOARD_REWARDS[i];
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${r.rank}`;
          return (
            <div key={r.username} className={`flex items-center gap-3 px-3 py-2.5 ${i < rows.length - 1 ? "border-b border-border" : ""} ${i < 3 ? "bg-brand-soft/40" : ""}`}>
              <span className="w-8 text-sm font-black text-center">{medal}</span>
              <div className="h-9 w-9 rounded-full brand-gradient flex items-center justify-center text-white text-[11px] font-black">
                {r.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">@{r.username} · {r.referrals} refs</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-primary">{formatNGN(r.earnings)}</p>
                {reward && <p className="text-[9px] font-black text-green-600">+{formatNGN(reward)}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

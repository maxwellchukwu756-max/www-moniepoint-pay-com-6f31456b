import { Award } from "lucide-react";
import { BADGE_DEFS, useBadges } from "@/lib/rewards";

export function Badges() {
  const unlocked = useBadges();
  return (
    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /> Achievements</h3>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {BADGE_DEFS.map((b) => {
          const on = unlocked[b.id];
          return (
            <div key={b.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-center px-1 ${on ? "brand-gradient text-white" : "bg-muted text-muted-foreground"}`}
              style={on ? { boxShadow: "var(--shadow-card)" } : undefined}>
              <span className={`text-xl ${on ? "" : "grayscale opacity-50"}`}>{b.emoji}</span>
              <span className="text-[8px] font-black mt-1 leading-tight">{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

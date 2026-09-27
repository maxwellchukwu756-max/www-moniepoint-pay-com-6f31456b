import { Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Check, Gift, X, Clock } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { formatNGN } from "@/lib/store";

export type ActivityItem = {
  id: string;
  title: string;
  sub: string;
  amount: number;
  status: string;
  dateISO: string;
};

export function ActivityPage({
  tab, title, subtitle, items, emptyText, onMount, unreadTx = 0, unreadRewards = 0,
}: {
  tab: "transactions" | "rewards";
  title: string;
  subtitle: string;
  items: ActivityItem[];
  emptyText: string;
  onMount?: () => void;
  unreadTx?: number;
  unreadRewards?: number;
}) {
  const router = useRouter();
  useEffect(() => { onMount?.(); }, [onMount]);
  const isReward = tab === "rewards";

  const tabCls = (active: boolean) =>
    `flex-1 relative text-center text-[11px] font-black uppercase tracking-wider py-2.5 rounded-xl transition ${active ? "bg-white text-primary shadow" : "text-white/90"}`;
  const badge = (n: number): ReactNode =>
    n > 0 ? <span className="ml-1 inline-flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-destructive text-[9px] text-white">{n}</span> : null;

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col bg-background text-foreground">
        <div className="px-6 pt-10 pb-5 brand-gradient text-white">
          <button onClick={() => router.history.back()} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              {isReward ? <Gift className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{title}</h1>
              <p className="text-[11px] opacity-90">{subtitle}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-1 p-1 rounded-2xl bg-white/15 backdrop-blur">
            <Link to="/notifications" className={tabCls(!isReward)}>Transaction Activities{isReward && badge(unreadTx)}</Link>
            <Link to="/notifications/rewards" className={tabCls(isReward)}>Rewards / EARN{!isReward && badge(unreadRewards)}</Link>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center mx-2">
              <p className="text-sm font-bold">Nothing here yet</p>
              <p className="text-[11px] text-muted-foreground mt-1">{emptyText}</p>
            </div>
          ) : (
            items.map((n, i) => {
              const d = new Date(n.dateISO);
              const isIn = n.amount > 0;
              const Icon = n.status === "Failed" ? X : n.status === "Pending" ? Clock : isReward ? Gift : Check;
              return (
                <motion.div
                  key={n.id + i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 20) * 0.02 }}
                  className="rounded-2xl bg-card border border-border p-3.5 flex items-start gap-3"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="h-10 w-10 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold truncate">{n.title}</p>
                      {n.amount !== 0 && (
                        <span className={`text-sm font-black shrink-0 ${isIn ? "text-primary" : "text-foreground"}`}>
                          {isIn ? "+" : "-"}{formatNGN(Math.abs(n.amount))}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{n.sub}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full bg-brand-soft text-primary">{n.status}</span>
                      <span className="text-[10px] text-muted-foreground">{d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      <span className="text-[10px] text-muted-foreground">· {d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}

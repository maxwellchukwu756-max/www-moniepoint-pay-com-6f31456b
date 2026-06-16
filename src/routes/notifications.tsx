import { createFileRoute, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Check } from "lucide-react";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useNotifications, formatNGN } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Moniepoint Pay" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAllRead } = useNotifications();

  useEffect(() => { markAllRead(); }, [markAllRead]);

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col bg-background text-foreground">
        <div className="px-6 pt-10 pb-6 brand-gradient text-white">
          <button onClick={() => router.history.back()} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Notifications</h1>
              <p className="text-[11px] opacity-90">All your transaction activities</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center mx-2">
              <p className="text-sm font-bold">No notifications yet</p>
              <p className="text-[11px] text-muted-foreground mt-1">Your transaction activity will appear here</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const d = new Date(n.dateISO);
              const isIn = n.amount > 0;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="rounded-2xl bg-card border border-border p-3.5 flex items-start gap-3"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="h-10 w-10 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5 text-primary" strokeWidth={3} />
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

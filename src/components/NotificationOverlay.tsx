import { motion, AnimatePresence } from "framer-motion";
import { BellRing, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { enableOneSignal } from "@/lib/onesignal";
import { enablePush } from "@/lib/earn";
import { isNotifEnabled, setNotifEnabled } from "@/lib/rewards";

export function NotificationOverlay() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") return; // unsupported
    if (isNotifEnabled() && Notification.permission === "granted") return;
    setOpen(true);
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    try {
      const ok = await enablePush();
      await enableOneSignal();
      if (ok && typeof Notification !== "undefined" && Notification.permission === "granted") {
        setNotifEnabled(true);
        setOpen(false);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: "rgba(2, 6, 40, 0.85)", backdropFilter: "blur(10px)" }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="w-full max-w-[380px] bg-background rounded-3xl p-7 text-center relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full brand-gradient opacity-20" />
            <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full brand-gradient opacity-10" />

            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto h-20 w-20 rounded-3xl brand-gradient flex items-center justify-center text-white"
              style={{ boxShadow: "0 20px 40px -10px rgba(0,0,255,0.35)" }}
            >
              <BellRing className="h-9 w-9" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-300" />
            </motion.div>

            <h2 className="relative mt-6 text-xl font-black">Moniepoint Pay Notifications</h2>
            <p className="relative mt-3 text-sm text-muted-foreground leading-relaxed">
              Enable notifications to receive balance alerts, MPAY updates, account activity, rewards and important reminders.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={busy}
              onClick={handleEnable}
              className="relative mt-7 w-full h-14 rounded-2xl brand-gradient text-white font-black text-sm tracking-wide disabled:opacity-70"
              style={{ boxShadow: "0 12px 30px -10px rgba(0,0,255,0.5)" }}
            >
              {busy ? "ENABLING…" : "ENABLE NOTIFICATIONS"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

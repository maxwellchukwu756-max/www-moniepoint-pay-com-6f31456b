import { motion, AnimatePresence } from "framer-motion";
import { BellRing, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { enableOneSignal } from "@/lib/onesignal";
import { enablePush } from "@/lib/earn";
import { isNotifEnabled, setNotifEnabled } from "@/lib/rewards";

export function NotificationOverlay() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already enabled in our app-side flag → don't show again
    if (isNotifEnabled()) return;
    // If browser natively granted, mark and skip
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      setNotifEnabled(true);
      return;
    }
    setOpen(true);
  }, []);

  const supportsNotifications =
    typeof window !== "undefined" && typeof Notification !== "undefined";

  const handleEnable = async () => {
    setBusy(true);
    setErrorMsg(null);

    // Browser has no Notification API (some in-app browsers / older Samsung).
    // Still enable in-app alerts + fire OneSignal (uses service worker) and close.
    if (!supportsNotifications) {
      try { await enableOneSignal(); } catch {}
      setNotifEnabled(true);
      setOpen(false);
      setBusy(false);
      return;
    }

    try {
      // Fire OneSignal in parallel (its own permission flow will piggy-back).
      enableOneSignal().catch(() => {});

      // Call requestPermission directly inside the user gesture — required by
      // Samsung Internet / iOS Safari / strict Chromium. Support both
      // callback and Promise signatures.
      let perm: NotificationPermission = Notification.permission;
      if (perm === "default") {
        perm = await new Promise<NotificationPermission>((resolve) => {
          let settled = false;
          const done = (p: NotificationPermission) => {
            if (settled) return;
            settled = true;
            resolve(p);
          };
          try {
            const maybe = Notification.requestPermission((p) => done(p));
            if (maybe && typeof (maybe as Promise<NotificationPermission>).then === "function") {
              (maybe as Promise<NotificationPermission>).then(done).catch(() => done(Notification.permission));
            }
          } catch {
            done(Notification.permission);
          }
          // Safety timeout — some browsers never resolve if dialog is dismissed.
          setTimeout(() => done(Notification.permission), 15000);
        });
      }

      if (perm === "granted") {
        await enablePush();
        setNotifEnabled(true);
        setOpen(false);
      } else if (perm === "denied") {
        // Permission denied — still let user into the app, but keep flag off
        // so we can re-prompt next session. Show guidance.
        setErrorMsg(
          "Notifications are blocked in your browser settings. Please enable them from the site settings, then reopen the app."
        );
        // Allow proceeding after 1.5s
        setTimeout(() => {
          setNotifEnabled(true);
          setOpen(false);
        }, 1800);
      } else {
        // default / dismissed — mark enabled so user can continue
        setNotifEnabled(true);
        setOpen(false);
      }
    } catch {
      // Never trap the user — always let them into the dashboard
      setNotifEnabled(true);
      setOpen(false);
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

            {errorMsg && (
              <p className="relative mt-3 text-xs text-red-500 leading-relaxed font-semibold">
                {errorMsg}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={busy}
              onClick={handleEnable}
              className="relative mt-6 w-full h-14 rounded-2xl brand-gradient text-white font-black text-sm tracking-wide disabled:opacity-70"
              style={{ boxShadow: "0 12px 30px -10px rgba(0,0,255,0.5)" }}
            >
              {busy ? "ENABLING…" : "ENABLE NOTIFICATIONS"}
            </motion.button>

            <button
              onClick={() => {
                setNotifEnabled(true);
                setOpen(false);
              }}
              className="relative mt-3 text-[11px] font-semibold text-muted-foreground underline"
            >
              Continue without notifications
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

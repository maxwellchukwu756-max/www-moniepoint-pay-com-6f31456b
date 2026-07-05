import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSpin, SPIN_REWARDS, SPIN_SEGMENTS, addRewardHistory, unlockBadge } from "@/lib/rewards";
import { useBalance, formatNGN } from "@/lib/store";

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function useToday() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// Small confetti field
const CONFETTI = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.6,
  duration: 2 + Math.random() * 2,
  color: ["#3B82F6", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4"][i % 7],
  size: 6 + Math.round(Math.random() * 6),
  shape: i % 2 === 0 ? "square" : "circle",
}));

export function SpinWheel() {
  const { ready, msUntil, spin } = useSpin();
  const { balance, setBalance } = useBalance();
  const [rotate, setRotate] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [celebrating, setCelebrating] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const today = useToday();

  useEffect(() => {
    if (ready) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [ready, now]);

  const dateLabel = useMemo(
    () => today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [today]
  );

  const seg = 360 / SPIN_SEGMENTS.length;

  const doSpin = () => {
    const amt = spin();
    if (amt === null) return;
    setSpinning(true);
    // Find a segment index whose value matches the drawn amount (winning segments only)
    const winningIndices = SPIN_SEGMENTS
      .map((v, i) => (v === amt ? i : -1))
      .filter(i => i >= 0);
    const idx = winningIndices[Math.floor(Math.random() * winningIndices.length)];
    // Rotate so pointer (top) lands on center of segment idx
    const target = 360 * 6 + (360 - idx * seg - seg / 2);
    setRotate(target);

    setTimeout(() => {
      setSpinning(false);
      setCelebrating(amt);
      // 5 second celebration, then credit balance
      setTimeout(() => {
        setBalance(balance + amt);
        addRewardHistory({ kind: "spin", title: "Spin & Win", amount: amt });
        const u = unlockBadge("task_champion");
        if (u.unlocked) {
          setBalance(balance + amt + u.reward);
          addRewardHistory({ kind: "badge", title: "Badge: Task Champion", amount: u.reward });
        }
        setCelebrating(null);
      }, 5000);
    }, 3800);
  };

  return (
    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" /> Spin & Win
        </h3>
        {!ready && (
          <span className="text-[10px] font-black text-muted-foreground">
            Next spin in {formatCountdown(msUntil)}
          </span>
        )}
      </div>

      <div
        className="bg-white border border-border rounded-2xl p-5 flex flex-col items-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-[11px] text-muted-foreground">{dateLabel}</p>
        <h4 className="text-lg font-black mt-0.5">Congratulations!</h4>
        <p className="text-[11px] text-center text-muted-foreground mt-0.5 max-w-[260px]">
          You're in today's reward draw. Spin the wheel and see what comes up.
        </p>

        <div className="relative w-64 h-64 mt-4">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-[#1E3A8A]" />

          <motion.div
            animate={{ rotate }}
            transition={{ duration: spinning ? 3.6 : 0, ease: [0.17, 0.67, 0.24, 1] }}
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              border: "8px solid #1E3A8A",
              background: `conic-gradient(${SPIN_SEGMENTS.map((_, i) => {
                const c = i % 2 === 0 ? "#ffffff" : "#DBEAFE";
                return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
              }).join(",")})`,
              boxShadow: "0 10px 30px -10px rgba(30,58,138,0.4)",
            }}
          >
            {/* Divider lines */}
            {SPIN_SEGMENTS.map((_, i) => (
              <div
                key={`line-${i}`}
                className="absolute top-1/2 left-1/2 origin-left"
                style={{
                  width: "50%",
                  height: 1,
                  background: "#1E3A8A",
                  opacity: 0.35,
                  transform: `rotate(${i * seg}deg)`,
                }}
              />
            ))}

            {/* Segment content */}
            {SPIN_SEGMENTS.map((val, i) => {
              const angle = i * seg + seg / 2;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-88px) rotate(${-angle}deg)`,
                    transformOrigin: "0 0",
                  }}
                >
                  {val === 0 ? (
                    <div className="h-8 w-8 rounded-full border-2 border-red-500 flex items-center justify-center bg-white">
                      <X className="h-4 w-4 text-red-500" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-black text-green-700 whitespace-nowrap">
                        ₦{val.toLocaleString()}
                      </span>
                      <div className="text-[14px] leading-none">💵</div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Center hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white border-4 border-[#1E3A8A] flex items-center justify-center z-10 shadow-lg">
            <span className="text-xl">🎁</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!ready || spinning || celebrating !== null}
          onClick={doSpin}
          className="mt-5 w-full h-11 rounded-xl brand-gradient text-white font-black text-xs disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
          {spinning ? "SPINNING…" : celebrating !== null ? "CONGRATULATIONS!" : ready ? "SPIN NOW" : `NEXT SPIN ${formatCountdown(msUntil)}`}
        </motion.button>
      </div>

      {/* Celebration overlay — lasts 5s before crediting */}
      <AnimatePresence>
        {celebrating !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex flex-col items-center justify-start pt-16 bg-white overflow-hidden"
          >
            {/* Confetti */}
            {CONFETTI.map(c => (
              <motion.div
                key={c.id}
                initial={{ y: -40, opacity: 0, rotate: 0 }}
                animate={{ y: "110vh", opacity: [0, 1, 1, 0.8], rotate: 360 }}
                transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "linear" }}
                className="absolute"
                style={{
                  left: `${c.left}%`,
                  width: c.size,
                  height: c.size,
                  background: c.color,
                  borderRadius: c.shape === "circle" ? "50%" : 2,
                }}
              />
            ))}

            <div className="relative z-10 text-center px-6">
              <p className="text-xs text-muted-foreground">
                {dateLabel}
              </p>
              <h2 className="mt-2 text-3xl font-black text-foreground">Congratulations!</h2>
              <p className="mt-2 text-sm text-muted-foreground">You're in today's reward draw.</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[300px] mx-auto">
                A small number of Nigerian users are being selected for our partner cash reward.
              </p>
            </div>

            {/* Cash stack illustration */}
            <motion.div
              initial={{ scale: 0.4, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, delay: 0.2 }}
              className="relative z-10 mt-8"
            >
              <div className="text-[120px] leading-none select-none" aria-hidden>💵</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-10 mt-6 text-center"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">You won</p>
              <h3 className="mt-1 text-4xl font-black text-green-600">
                {formatNGN(celebrating)}
              </h3>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Adding to your available balance…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

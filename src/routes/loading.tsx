import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { CreditCard, Wallet, Send, Smartphone, Receipt, Banknote } from "lucide-react";

export const Route = createFileRoute("/loading")({
  head: () => ({
    meta: [{ title: "Loading — Moniepoint Pay" }],
  }),
  component: LoadingPage,
});

const icons = [CreditCard, Wallet, Send, Smartphone, Receipt, Banknote];

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex justify-center bg-surface">
      <div className="w-full md:max-w-[420px] relative flex flex-col min-h-screen brand-gradient overflow-hidden items-center justify-center text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }} />
        <div className="pointer-events-none absolute bottom-0 -right-24 h-72 w-72 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />

        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/30"
          />
          {/* Inner counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full border border-white/40"
          />

          {/* Orbiting icons */}
          {icons.map((Icon, i) => {
            const angle = (i / icons.length) * 360;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "100%",
                  height: "100%",
                  transformOrigin: "center",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <div
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translate(96px) rotate(-${angle}deg) translate(-50%, -50%)`,
                  }}
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center"
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}

          {/* Center pulsing logo */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-20 w-20 rounded-[22px] bg-white flex items-center justify-center"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
          >
            <span className="text-3xl font-black" style={{ color: "#0000FF" }}>M</span>
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 text-base font-black tracking-tight"
        >
          MONIEPOINT PAY
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-1 text-[11px] text-white/80"
        >
          Securing your banking experience...
        </motion.p>

        <div className="mt-6 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

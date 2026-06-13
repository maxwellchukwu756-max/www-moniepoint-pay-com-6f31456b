import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Phone, CreditCard, Video } from "lucide-react";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Activate — Moniepoint Pay" },
      { name: "description", content: "Activate your Moniepoint Pay account." },
    ],
  }),
  component: Activate,
});

function Activate() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen w-full flex justify-center bg-surface">
      <div className="w-full md:max-w-[420px] relative flex flex-col min-h-screen brand-gradient overflow-hidden">
        {/* Soft glow blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }} />
        <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Top header */}
        <div className="relative pt-10 pb-8 flex flex-col items-center text-white">
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-20 w-20 rounded-[22px] bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.18)" }}
          >
            <span className="text-3xl font-black leading-none">M</span>
            <span className="text-[9px] mt-1 opacity-90 tracking-wide">Moniepoint</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-2xl font-black tracking-tight"
          >
            Moniepoint Pay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-1 text-xs text-white/80"
          >
            Secure Financial Solutions
          </motion.p>
        </div>

        {/* White sheet */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative flex-1 bg-white rounded-t-[28px] px-6 pt-7 pb-7 flex flex-col"
          style={{ boxShadow: "0 -8px 30px -10px rgba(0,0,0,0.12)" }}
        >
          <h2 className="text-lg font-black tracking-tight">Activate Your Account</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter your authorization code to proceed
          </p>

          <div className="mt-5">
            <label className="text-xs font-bold">Authorization Code</label>
            <div className="mt-2 relative">
              <input
                type={show ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="w-full h-12 rounded-xl bg-muted border border-border focus:border-primary focus:bg-white outline-none px-4 pr-11 text-sm font-mono tracking-widest transition-all"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-5 w-full h-12 rounded-xl text-white text-sm font-bold brand-gradient"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            Activate Account
          </motion.button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground tracking-widest font-semibold">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button className="w-full h-11 rounded-xl bg-muted text-foreground text-xs font-bold flex items-center justify-center gap-2 border border-border">
            <Phone className="h-3.5 w-3.5" /> Contact Admin
          </button>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-brand-soft text-primary border border-border">
              <CreditCard className="h-3.5 w-3.5" /> Buy Code
            </button>
            <button className="h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-brand-soft text-primary border border-border">
              <Video className="h-3.5 w-3.5" /> Watch
            </button>
          </div>

          <div className="flex-1" />

          <p className="mt-6 text-center text-[10px] text-muted-foreground leading-relaxed">
            Licensed by the <span className="font-semibold text-foreground">Central Bank of Nigeria</span> and insured by NDIC.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

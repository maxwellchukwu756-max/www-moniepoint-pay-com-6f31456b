import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Globe2, ArrowRight } from "lucide-react";
import { MoniepointLogo } from "@/components/MoniepointLogo";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Moniepoint Pay" },
      { name: "description", content: "Secure digital payments made simple." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <MoniepointLogo size={72} rounded={20} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 text-center"
        >
          <p className="text-sm font-medium tracking-wide uppercase" style={{ color: "#0000FF" }}>
            WELCOME TO
          </p>
          <h1 className="mt-1 text-lg font-black tracking-tight" style={{ color: "#0000FF" }}>
            MONIEPOINT PAY
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Secure digital payments made simple.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed px-3">
            Send money instantly, manage transactions, pay bills, and access financial services with speed and security.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 mx-auto w-full max-w-[260px] rounded-2xl p-5 bg-card border border-border text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center bg-brand-soft">
            <Globe2 className="h-6 w-6" style={{ color: "#0000FF" }} />
          </div>
          <h3 className="mt-3 font-semibold text-sm">24/7 Banking</h3>
          <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
            Access your account anytime, anywhere.
          </p>
        </motion.div>

        <div className="flex-1" />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/activate" })}
          className="mt-8 w-full h-14 rounded-3xl text-white font-semibold text-base flex items-center justify-center gap-2 brand-gradient"
          style={{ boxShadow: "var(--shadow-float)" }}
        >
          GET STARTED <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </PhoneFrame>
  );
}

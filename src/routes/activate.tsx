import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, User, Phone, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Create Account — Moniepoint Pay" },
      { name: "description", content: "Create your Moniepoint Pay account." },
    ],
  }),
  component: Activate,
});

type Mode = "signup" | "signin";

function Activate() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = () => {
    setError("");
    if (!fullName || !phone || !email || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    const account = { fullName, phone, email, password };
    localStorage.setItem("mp_account", JSON.stringify(account));
    navigate({ to: "/loading" });
  };

  const handleSignIn = () => {
    setError("");
    const raw = localStorage.getItem("mp_account");
    if (!raw) {
      setError("No account found. Please create an account first.");
      return;
    }
    const acct = JSON.parse(raw);
    if (
      (email === acct.email || phone === acct.phone) &&
      password === acct.password
    ) {
      navigate({ to: "/loading" });
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-surface">
      <div className="w-full md:max-w-[420px] relative flex flex-col min-h-screen brand-gradient overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }} />
        <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />

        <div className="relative pt-8 pb-5 flex flex-col items-center text-white">
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-16 w-16 rounded-[18px] bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.18)" }}
          >
            <span className="text-2xl font-black leading-none">M</span>
          </motion.div>
          <h1 className="mt-3 text-base font-black tracking-tight">Moniepoint Pay</h1>
          <p className="mt-0.5 text-[11px] text-white/80">Secure Financial Solutions</p>
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative flex-1 bg-white rounded-t-[28px] px-6 pt-6 pb-6 flex flex-col"
          style={{ boxShadow: "0 -8px 30px -10px rgba(0,0,0,0.12)" }}
        >
          <h2 className="text-xs font-bold tracking-tight text-muted-foreground uppercase">
            {mode === "signup" ? "Create an account with" : "Welcome back to"}
          </h2>
          <p className="text-lg font-black tracking-tight" style={{ color: "#0000FF" }}>
            MONIEPOINT PAY
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "signup"
              ? "Fill in your details to get started"
              : "Sign in to access your account"}
          </p>

          <div className="mt-4 space-y-3">
            {mode === "signup" && (
              <Field icon={User} placeholder="Full Name" value={fullName} onChange={setFullName} />
            )}
            {mode === "signup" && (
              <Field icon={Phone} placeholder="Phone Number" value={phone} onChange={setPhone} type="tel" />
            )}
            <Field
              icon={Mail}
              placeholder={mode === "signup" ? "Email" : "Email or Phone"}
              value={email}
              onChange={setEmail}
              type={mode === "signup" ? "email" : "text"}
            />
            <Field
              icon={Lock}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              type={showPwd ? "text" : "password"}
              trailing={
                <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-muted-foreground hover:text-primary">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {mode === "signup" && (
              <Field
                icon={Lock}
                placeholder="Confirm Password"
                value={confirm}
                onChange={setConfirm}
                type={showConfirm ? "text" : "password"}
                trailing={
                  <button type="button" onClick={() => setShowConfirm((s) => !s)} className="text-muted-foreground hover:text-primary">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            )}
          </div>

          {error && <p className="mt-3 text-[11px] font-medium text-red-600">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={mode === "signup" ? handleCreate : handleSignIn}
            className="mt-5 w-full h-12 rounded-xl text-white text-sm font-bold brand-gradient"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            {mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
          </motion.button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground tracking-widest font-semibold">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={() => {
              setError("");
              setMode((m) => (m === "signup" ? "signin" : "signup"));
            }}
            className="w-full h-11 rounded-xl bg-brand-soft text-primary text-xs font-bold border border-border"
          >
            {mode === "signup" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>

          <p className="mt-5 text-center text-[10px] text-muted-foreground leading-relaxed">
            Licensed by the <span className="font-semibold text-foreground">Central Bank of Nigeria</span> and insured by NDIC.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  trailing,
}: {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl bg-muted border border-border focus:border-primary focus:bg-white outline-none pl-10 pr-10 text-sm transition-all"
      />
      {trailing && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</div>
      )}
    </div>
  );
}

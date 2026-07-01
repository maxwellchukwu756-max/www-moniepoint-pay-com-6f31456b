// Shared Earn More task definitions so gated pages can show a per-task
// checklist that matches the actual tasks rendered on /earn-more.

export const ALL_TASKS = [
  "Watch videos and earn",
  "Follow social media pages",
  "Install partner apps",
  "Complete surveys",
  "Refer friends to MoniePoint Pay",
  "Share posts on Facebook",
  "Rate apps on Play Store",
  "Daily check-in",
  "Spin and win",
  "Quiz competitions",
  "Read MoniePoint blog articles",
  "Subscribe to newsletter",
  "Try new features",
  "Watch ads",
  "Engage on Twitter / X",
  "Like Instagram posts",
  "Comment on TikTok videos",
  "Join WhatsApp community",
  "Test new payment features",
  "Refer a merchant",
  "Watch product tutorial",
  "Complete profile setup",
  "Verify phone number",
  "Set transaction PIN",
  "Invite via SMS",
  "Add a beneficiary",
  "Pay a bill challenge",
  "Save ₦1,000 challenge",
  "Send first transfer",
  "Buy airtime challenge",
];

export const REWARDS = [500, 1000, 1500, 2000, 2500, 3000];

export const REQUIRED_DAILY_TASKS = 12;
export const COMPLETED_KEY = "mp_earn_completed";
export const PUSH_OPT_KEY = "mp_push_opt";
export const LAST_NOTIFIED_DAY_KEY = "mp_earn_last_notified_day";

export function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function seededRand(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 0xffffffff;
  };
}

export type EarnTask = { id: string; title: string; reward: number };

export function getTodaysTasks(): EarnTask[] {
  const rand = seededRand(dayKey());
  const tasksShuffled = [...ALL_TASKS].sort(() => rand() - 0.5).slice(0, REQUIRED_DAILY_TASKS);
  return tasksShuffled.map((t, i) => ({
    id: `${dayKey()}-${i}`,
    title: t,
    reward: REWARDS[Math.floor(rand() * REWARDS.length)],
  }));
}

// ---------- Browser push notifications ----------

export function pushOptedIn() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PUSH_OPT_KEY) === "1";
}

export function pushPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export async function enablePush(): Promise<boolean> {
  if (typeof window === "undefined" || typeof Notification === "undefined") return false;
  let perm = Notification.permission;
  if (perm === "default") {
    try { perm = await Notification.requestPermission(); } catch { return false; }
  }
  if (perm === "granted") {
    localStorage.setItem(PUSH_OPT_KEY, "1");
    return true;
  }
  return false;
}

export function disablePush() {
  if (typeof window === "undefined") return;
  localStorage.setItem(PUSH_OPT_KEY, "0");
}

export function firePush(title: string, body: string) {
  if (!pushOptedIn()) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico", tag: "mp-earn" });
  } catch {}
}

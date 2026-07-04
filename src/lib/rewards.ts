import { useCallback, useEffect, useState } from "react";

const DAILY_KEY = "mp_daily_reward";
const SPIN_KEY = "mp_spin_last";
const BADGES_KEY = "mp_badges";
const REWARD_HISTORY_KEY = "mp_reward_history";

export const DAILY_REWARDS = [100, 150, 200, 250, 300, 350, 500];
export const DAILY_BONUS = 1000; // day 7 bonus

export const SPIN_REWARDS = [100, 200, 500, 1000, 1500, 2000, 750, 300];

export const LEADERBOARD_REWARDS = [10000, 7500, 5000];

export type RewardKind = "daily" | "spin" | "leaderboard" | "bonus" | "task" | "badge" | "referral";
export type RewardEntry = {
  id: string;
  kind: RewardKind;
  title: string;
  amount: number;
  dateISO: string;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Reward History ----------

export function addRewardHistory(entry: Omit<RewardEntry, "id" | "dateISO">) {
  const item: RewardEntry = {
    ...entry,
    id: "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    dateISO: new Date().toISOString(),
  };
  const list = [item, ...read<RewardEntry[]>(REWARD_HISTORY_KEY, [])].slice(0, 200);
  write(REWARD_HISTORY_KEY, list);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mp:rewards"));
  return item;
}

export function useRewardHistory() {
  const [items, setItems] = useState<RewardEntry[]>([]);
  useEffect(() => {
    setItems(read<RewardEntry[]>(REWARD_HISTORY_KEY, []));
    const fn = () => setItems(read<RewardEntry[]>(REWARD_HISTORY_KEY, []));
    window.addEventListener("mp:rewards", fn);
    return () => window.removeEventListener("mp:rewards", fn);
  }, []);
  return items;
}

// ---------- Daily Reward ----------

type DailyState = { streak: number; lastClaimISO: string | null };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function daysBetween(a: string, b: string) {
  const da = new Date(a); da.setHours(0, 0, 0, 0);
  const db = new Date(b); db.setHours(0, 0, 0, 0);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function useDailyReward() {
  const [state, setState] = useState<DailyState>({ streak: 0, lastClaimISO: null });
  useEffect(() => {
    const s = read<DailyState>(DAILY_KEY, { streak: 0, lastClaimISO: null });
    // Reset if missed a day
    if (s.lastClaimISO) {
      const diff = daysBetween(s.lastClaimISO, todayStr());
      if (diff > 1) s.streak = 0;
    }
    setState(s);
  }, []);

  const claimedToday = state.lastClaimISO === todayStr();
  const nextDay = Math.min((state.streak % 7) + 1, 7);
  const nextAmount = DAILY_REWARDS[nextDay - 1] + (nextDay === 7 ? DAILY_BONUS : 0);

  const claim = useCallback((): { amount: number; day: number } | null => {
    const s = read<DailyState>(DAILY_KEY, { streak: 0, lastClaimISO: null });
    if (s.lastClaimISO === todayStr()) return null;
    let streak = s.streak;
    if (s.lastClaimISO && daysBetween(s.lastClaimISO, todayStr()) === 1) streak += 1;
    else streak = 1;
    if (streak > 7) streak = 1;
    const amount = DAILY_REWARDS[streak - 1] + (streak === 7 ? DAILY_BONUS : 0);
    const next = { streak, lastClaimISO: todayStr() };
    write(DAILY_KEY, next);
    setState(next);
    return { amount, day: streak };
  }, []);

  return { streak: state.streak, claimedToday, nextDay, nextAmount, claim };
}

// ---------- Spin & Win ----------

export function useSpin() {
  const [lastSpin, setLastSpin] = useState<number>(0);
  useEffect(() => {
    setLastSpin(read<number>(SPIN_KEY, 0));
  }, []);
  const now = Date.now();
  const nextSpinAt = lastSpin + 24 * 60 * 60 * 1000;
  const ready = now >= nextSpinAt;
  const msUntil = Math.max(0, nextSpinAt - now);
  const spin = useCallback((): number | null => {
    const last = read<number>(SPIN_KEY, 0);
    if (Date.now() < last + 24 * 60 * 60 * 1000) return null;
    const amount = SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];
    write(SPIN_KEY, Date.now());
    setLastSpin(Date.now());
    return amount;
  }, []);
  return { ready, msUntil, spin };
}

// ---------- Badges ----------

export type BadgeId = "beginner" | "active" | "vip" | "referral_master" | "task_champion";
export const BADGE_DEFS: { id: BadgeId; label: string; emoji: string; reward: number; hint: string }[] = [
  { id: "beginner", label: "Beginner", emoji: "🌱", reward: 200, hint: "Sign in to Moniepoint Pay" },
  { id: "active", label: "Active User", emoji: "⚡", reward: 500, hint: "Claim daily reward 3 times" },
  { id: "vip", label: "VIP Member", emoji: "👑", reward: 1500, hint: "Reach a 7-day streak" },
  { id: "referral_master", label: "Referral Master", emoji: "🤝", reward: 2000, hint: "Refer 5 friends" },
  { id: "task_champion", label: "Task Champion", emoji: "🏆", reward: 1000, hint: "Win a spin" },
];

export function getBadges(): Record<BadgeId, boolean> {
  return read<Record<BadgeId, boolean>>(BADGES_KEY, {
    beginner: false, active: false, vip: false, referral_master: false, task_champion: false,
  });
}
export function unlockBadge(id: BadgeId): { unlocked: boolean; reward: number } {
  const b = getBadges();
  if (b[id]) return { unlocked: false, reward: 0 };
  b[id] = true;
  write(BADGES_KEY, b);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mp:badges"));
  const def = BADGE_DEFS.find(d => d.id === id)!;
  return { unlocked: true, reward: def.reward };
}
export function useBadges() {
  const [b, setB] = useState<Record<BadgeId, boolean>>(getBadges());
  useEffect(() => {
    setB(getBadges());
    const fn = () => setB(getBadges());
    window.addEventListener("mp:badges", fn);
    return () => window.removeEventListener("mp:badges", fn);
  }, []);
  return b;
}

// ---------- Leaderboard ----------

export type LeaderRow = { rank: number; name: string; username: string; referrals: number; earnings: number };
export function getLeaderboard(): LeaderRow[] {
  const seed = new Date();
  const week = Math.floor(seed.getTime() / (7 * 86400000));
  const names = [
    "Chinedu Okafor", "Aisha Bello", "Tunde Adebayo", "Ngozi Eze", "Yusuf Ibrahim",
    "Bisi Ogundipe", "Fatima Aliyu", "Emeka Nwankwo", "Kehinde Bakare", "Hauwa Sani",
  ];
  const rand = (i: number) => {
    const x = Math.sin(week * 999 + i * 17) * 10000;
    return x - Math.floor(x);
  };
  return names.map((name, i) => ({
    rank: i + 1,
    name,
    username: name.toLowerCase().replace(/\s+/g, ""),
    referrals: Math.max(3, Math.floor(80 - i * 6 - rand(i) * 5)),
    earnings: Math.floor((85000 - i * 6500) + rand(i) * 4000),
  })).sort((a, b) => b.referrals - a.referrals).map((r, i) => ({ ...r, rank: i + 1 }));
}

// ---------- Notification enabled flag (permanent) ----------

const NOTIF_ENABLED_KEY = "mp_notif_enabled";
export function isNotifEnabled() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(NOTIF_ENABLED_KEY) === "1";
}
export function setNotifEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_ENABLED_KEY, v ? "1" : "0");
}

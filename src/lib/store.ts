import { useEffect, useState, useCallback } from "react";

const BALANCE_KEY = "mp_balance";
const TXS_KEY = "mp_txs";
const ACCOUNT_KEY = "mp_account"; // current session: account snapshot
const ACCOUNTS_KEY = "mp_accounts"; // all registered accounts
const NOTIFS_KEY = "mp_notifications"; // transaction activities only
const REWARD_NOTIFS_KEY = "mp_reward_notifications"; // EARN / rewards only
const REFERRALS_KEY = "mp_referrals";

// Valid MPAY ID code constant — purchased/generated codes are NOT valid for transactions
export const MPAY_ID_CODE = "MPAY_lD64_-539@#gd";
export const INITIAL_BALANCE = 175000;
export const WHATSAPP_GROUP = "https://chat.whatsapp.com/GKp5HVIW7OC3Oa2t6Byztt?s=cl&p=a&mlu=4&ilr=4";
export const WHATSAPP_SUPPORT = "https://wa.me/2348000000000";

export type Account = {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  registeredAt: string;
  generatedCode?: string;
  referralCode: string;
  referredBy?: string;
};

export type Tx = {
  id: string;
  kind: "transfer" | "purchase" | "earn" | "withdraw";
  name: string;
  sub: string;
  amount: number; // negative = out, positive = in
  bank?: string;
  account?: string;
  reference: string;
  dateISO: string;
  hidden?: boolean;
};

export type Notification = {
  id: string;
  title: string;
  sub: string;
  amount: number;
  status: "Successful" | "Pending" | "Failed";
  dateISO: string;
  read?: boolean;
  category?: "transaction" | "reward";
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

// ---------- Accounts ----------

export function listAccounts(): Account[] {
  return read<Account[]>(ACCOUNTS_KEY, []);
}

export function getAccount(): Account | null {
  return read<Account | null>(ACCOUNT_KEY, null);
}

export function findByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return listAccounts().find(a => a.email.toLowerCase() === e);
}
export function findByUsername(username: string) {
  const u = username.trim().toLowerCase();
  return listAccounts().find(a => a.username.toLowerCase() === u);
}
export function findByPhone(phone: string) {
  const p = phone.trim();
  return listAccounts().find(a => a.phone === p);
}

export type SignUpInput = Omit<Account, "id" | "registeredAt" | "referralCode" | "generatedCode" | "referredBy"> & { referredBy?: string };

export function createAccount(input: SignUpInput): { ok: true; account: Account } | { ok: false; error: string } {
  if (findByEmail(input.email)) return { ok: false, error: "Email already registered." };
  if (findByUsername(input.username)) return { ok: false, error: "Username already taken." };
  const account: Account = {
    ...input,
    id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    registeredAt: new Date().toISOString(),
    referralCode: input.username.toUpperCase().replace(/[^A-Z0-9]/g, "") + Math.floor(100 + Math.random() * 900),
  };
  const all = listAccounts();
  all.push(account);
  write(ACCOUNTS_KEY, all);
  write(ACCOUNT_KEY, account);
  // award referrer if any
  if (input.referredBy) {
    const ref = listAccounts().find(a => a.referralCode === input.referredBy);
    if (ref) {
      const refs = read<Record<string, number>>(REFERRALS_KEY, {});
      refs[ref.id] = (refs[ref.id] ?? 0) + 1;
      write(REFERRALS_KEY, refs);
    }
  }
  return { ok: true, account };
}

export function signIn(identifier: string, password: string): { ok: true; account: Account } | { ok: false; error: string } {
  const id = identifier.trim();
  const acct = findByEmail(id) ?? findByUsername(id) ?? findByPhone(id);
  if (!acct) return { ok: false, error: "Account not found." };
  if (acct.password !== password) return { ok: false, error: "Incorrect password." };
  write(ACCOUNT_KEY, acct);
  return { ok: true, account: acct };
}

export function signOut() {
  localStorage.removeItem(ACCOUNT_KEY);
}

export function updateCurrentAccount(patch: Partial<Account>) {
  const a = getAccount();
  if (!a) return null;
  const updated = { ...a, ...patch };
  write(ACCOUNT_KEY, updated);
  const all = listAccounts().map(x => x.id === updated.id ? updated : x);
  write(ACCOUNTS_KEY, all);
  return updated;
}

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  useEffect(() => {
    setAccount(getAccount());
    const fn = () => setAccount(getAccount());
    window.addEventListener("mp:account", fn);
    return () => window.removeEventListener("mp:account", fn);
  }, []);
  return account;
}

// ---------- Balance ----------

export function useBalance() {
  const [balance, setBalanceState] = useState<number>(INITIAL_BALANCE);
  useEffect(() => {
    setBalanceState(read<number>(BALANCE_KEY, INITIAL_BALANCE));
    const onStorage = (e: StorageEvent) => {
      if (e.key === BALANCE_KEY) setBalanceState(read<number>(BALANCE_KEY, INITIAL_BALANCE));
    };
    const onLocal = () => setBalanceState(read<number>(BALANCE_KEY, INITIAL_BALANCE));
    window.addEventListener("storage", onStorage);
    window.addEventListener("mp:balance", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mp:balance", onLocal);
    };
  }, []);

  const setBalance = useCallback((next: number) => {
    localStorage.setItem(BALANCE_KEY, JSON.stringify(next));
    setBalanceState(next);
    window.dispatchEvent(new Event("mp:balance"));
  }, []);

  return { balance, setBalance };
}

// ---------- Transactions ----------

export function useTxs() {
  const [txs, setTxsState] = useState<Tx[]>([]);
  useEffect(() => {
    setTxsState(read<Tx[]>(TXS_KEY, []));
    const onLocal = () => setTxsState(read<Tx[]>(TXS_KEY, []));
    window.addEventListener("mp:txs", onLocal);
    return () => window.removeEventListener("mp:txs", onLocal);
  }, []);

  const addTx = useCallback((tx: Tx) => {
    const list = [tx, ...read<Tx[]>(TXS_KEY, [])].slice(0, 80);
    write(TXS_KEY, list);
    setTxsState(list);
    window.dispatchEvent(new Event("mp:txs"));
  }, []);

  return { txs: txs.filter(t => !t.hidden), addTx };
}

// ---------- Notifications ----------

function isRewardNotif(n: Notification) {
  if (n.category) return n.category === "reward";
  return /earn|reward|bonus|spin|streak|referral|leaderboard|badge/i.test(n.title);
}

// One-time migration: move existing EARN/reward entries out of the transaction list.
function migrateNotifs() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("mp_notifs_split_v1")) return;
  const all = read<Notification[]>(NOTIFS_KEY, []);
  const rewards = all.filter(isRewardNotif).map(n => ({ ...n, category: "reward" as const }));
  const txs = all.filter(n => !isRewardNotif(n)).map(n => ({ ...n, category: "transaction" as const }));
  const existing = read<Notification[]>(REWARD_NOTIFS_KEY, []);
  const ids = new Set(existing.map(e => e.id));
  write(NOTIFS_KEY, txs);
  write(REWARD_NOTIFS_KEY, [...existing, ...rewards.filter(r => !ids.has(r.id))]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, 200));
  localStorage.setItem("mp_notifs_split_v1", "1");
}

export function addNotification(n: Notification) {
  migrateNotifs();
  const reward = isRewardNotif(n);
  const key = reward ? REWARD_NOTIFS_KEY : NOTIFS_KEY;
  const item = { ...n, category: reward ? ("reward" as const) : ("transaction" as const) };
  const list = [item, ...read<Notification[]>(key, [])].slice(0, reward ? 200 : 100);
  write(key, list);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("mp:notif"));
}

export function useNotifications(kind: "transaction" | "reward" | "all" = "all") {
  const [txItems, setTx] = useState<Notification[]>([]);
  const [rwItems, setRw] = useState<Notification[]>([]);
  useEffect(() => {
    migrateNotifs();
    const fn = () => {
      setTx(read<Notification[]>(NOTIFS_KEY, []));
      setRw(read<Notification[]>(REWARD_NOTIFS_KEY, []));
    };
    fn();
    window.addEventListener("mp:notif", fn);
    return () => window.removeEventListener("mp:notif", fn);
  }, []);
  const markAllRead = useCallback(() => {
    const keys = kind === "transaction" ? [NOTIFS_KEY] : kind === "reward" ? [REWARD_NOTIFS_KEY] : [NOTIFS_KEY, REWARD_NOTIFS_KEY];
    for (const k of keys) write(k, read<Notification[]>(k, []).map(n => ({ ...n, read: true })));
    setTx(read<Notification[]>(NOTIFS_KEY, []));
    setRw(read<Notification[]>(REWARD_NOTIFS_KEY, []));
    window.dispatchEvent(new Event("mp:notif"));
  }, [kind]);
  const items = kind === "transaction" ? txItems : kind === "reward" ? rwItems : [...txItems, ...rwItems];
  const unread = items.filter(n => !n.read).length;
  return { notifications: items, unread, unreadTx: txItems.filter(n => !n.read).length, unreadRewards: rwItems.filter(n => !n.read).length, markAllRead };
}

// ---------- Generated MPAY ID code (per user, unique) ----------

export function generateMpayCode(account: Account): string {
  // pattern: MPAY%_ID{3}_CODE_{4}, deterministic-ish per user + a random salt
  const seed = (account.username + account.id + account.registeredAt).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const part1 = (100 + (seed % 900)).toString();
  const part2 = (1000 + Math.floor(Math.random() * 9000)).toString();
  return `MPAY%_ID${part1}_CODE_${part2}`;
}

export function isGeneratedCode(code: string): boolean {
  const c = code.trim();
  if (/^MPAY%_ID\d{3}_CODE_\d{4}$/.test(c)) return true;
  // also reject any previously generated code stored on accounts
  return listAccounts().some(a => a.generatedCode && a.generatedCode === c);
}

// Returns true if the input is a valid usable MPAY ID code for transactions.
// Generated/purchased codes are explicitly invalid.
export function isValidMpayForTx(code: string): boolean {
  const c = code.trim();
  if (!c) return false;
  if (isGeneratedCode(c)) return false;
  return c === MPAY_ID_CODE;
}

// ---------- Utilities ----------

export function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function genRef() {
  return "MP" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
}

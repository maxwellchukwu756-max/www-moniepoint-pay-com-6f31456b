import { useEffect, useState, useCallback } from "react";

const BALANCE_KEY = "mp_balance";
const TXS_KEY = "mp_txs";
const ACCOUNT_KEY = "mp_account";

export const MPAY_ID_CODE = "MPAY_lD64_-539@#gd";
export const INITIAL_BALANCE = 175000;

export type Account = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

export type Tx = {
  id: string;
  kind: "transfer" | "purchase";
  name: string;
  sub: string;
  amount: number; // negative = out, positive = in
  bank?: string;
  account?: string;
  reference: string;
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

export function getAccount(): Account | null {
  return read<Account | null>(ACCOUNT_KEY, null);
}

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  useEffect(() => { setAccount(getAccount()); }, []);
  return account;
}

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

export function useTxs() {
  const [txs, setTxsState] = useState<Tx[]>([]);
  useEffect(() => {
    setTxsState(read<Tx[]>(TXS_KEY, []));
    const onLocal = () => setTxsState(read<Tx[]>(TXS_KEY, []));
    window.addEventListener("mp:txs", onLocal);
    return () => window.removeEventListener("mp:txs", onLocal);
  }, []);

  const addTx = useCallback((tx: Tx) => {
    const list = [tx, ...read<Tx[]>(TXS_KEY, [])].slice(0, 50);
    localStorage.setItem(TXS_KEY, JSON.stringify(list));
    setTxsState(list);
    window.dispatchEvent(new Event("mp:txs"));
  }, []);

  return { txs, addTx };
}

export function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function genRef() {
  return "MP" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
}

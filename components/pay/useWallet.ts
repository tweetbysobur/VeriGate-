"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connect as connectWallet,
  currentAccount,
  disconnect as disconnectWallet,
  getProvider,
} from "@/lib/web3/monad";

export interface UseWallet {
  account: string | null;
  connecting: boolean;
  hasWallet: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useWallet(): UseWallet {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    const p = getProvider();
    setHasWallet(!!p);
    if (!p) return;
    currentAccount()
      .then((a) => setAccount(a))
      .catch(() => {});

    const onAccountsChanged = (...args: unknown[]) => {
      const accts = args[0] as string[] | undefined;
      setAccount(accts?.[0] ?? null);
    };
    p.on?.("accountsChanged", onAccountsChanged);
    return () => p.removeListener?.("accountsChanged", onAccountsChanged);
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      setAccount(await connectWallet());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAccount(null);
  }, []);

  return { account, connecting, hasWallet, error, connect, disconnect };
}

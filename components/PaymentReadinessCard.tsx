"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/pay/useWallet";
import { shortAddr } from "@/lib/demo";

interface ReadinessStatus {
  walletConnected: boolean;
  apassVerified: boolean;
  monBalance: number;
  ausducBalance: number;
  apassTier?: string;
  isReady: boolean;
}

async function checkApassStatus(address: string): Promise<{ verified: boolean; tier?: string }> {
  try {
    const res = await fetch("/api/apass/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chain: "monad", address }),
    });
    const data = await res.json();
    return { verified: data.status === "verified", tier: data.tier };
  } catch {
    return { verified: false };
  }
}

async function getBalances(address: string): Promise<{ mon: number; ausdc: number }> {
  // In a real implementation, this would fetch from the blockchain
  // For now, return placeholder values
  return { mon: 0, ausdc: 0 };
}

export function PaymentReadinessCard() {
  const wallet = useWallet();
  const [status, setStatus] = useState<ReadinessStatus>({
    walletConnected: false,
    apassVerified: false,
    monBalance: 0,
    ausducBalance: 0,
    isReady: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkReadiness() {
      if (!wallet.account) {
        setStatus((s) => ({ ...s, walletConnected: false, apassVerified: false, isReady: false }));
        return;
      }

      setLoading(true);
      const [apass, balances] = await Promise.all([
        checkApassStatus(wallet.account),
        getBalances(wallet.account),
      ]);

      const ready = apass.verified && balances.mon > 0 && balances.ausdc > 0;
      setStatus({
        walletConnected: true,
        apassVerified: apass.verified,
        monBalance: balances.mon,
        ausducBalance: balances.ausdc,
        apassTier: apass.tier,
        isReady: ready,
      });
      setLoading(false);
    }

    checkReadiness();
  }, [wallet.account]);

  const items = [
    {
      label: "Wallet Connected",
      status: status.walletConnected,
      value: status.walletConnected ? shortAddr(wallet.account!) : "Not connected",
    },
    {
      label: "A-Pass Status",
      status: status.apassVerified,
      value: status.apassVerified ? `Verified · Tier ${status.apassTier}` : "Not verified",
    },
    {
      label: "MON Balance",
      status: status.monBalance > 0,
      value: `${status.monBalance} MON`,
    },
    {
      label: "aUSDC Balance",
      status: status.ausducBalance > 0,
      value: `${status.ausducBalance} aUSDC`,
    },
    {
      label: "Network",
      status: true,
      value: "Monad Testnet",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Payment Readiness</h3>
        {loading ? (
          <span className="text-xs text-muted">Checking...</span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              status.isReady
                ? "bg-verify-500/10 text-verify-600"
                : "bg-warn/10 text-warn"
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
              {status.isReady ? (
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M12 9v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
            {status.isReady ? "Ready" : "Action Required"}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-muted">{item.label}</span>
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className={`size-4 ${item.status ? "text-verify-500" : "text-muted"}`}
                fill="none"
              >
                {item.status ? (
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                )}
              </svg>
              <span className={`text-sm font-medium ${item.status ? "text-foreground" : "text-muted"}`}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

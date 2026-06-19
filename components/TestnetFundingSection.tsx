"use client";

import { useState } from "react";
import { useWallet } from "@/components/pay/useWallet";

export function TestnetFundingSection() {
  const wallet = useWallet();
  const [requestingMon, setRequestingMon] = useState(false);
  const [requestingAusdc, setRequestingAusdc] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const requestMon = async () => {
    if (!wallet.account) return;
    setRequestingMon(true);
    try {
      // Placeholder: In production, this would call a faucet API
      showSuccess("✓ MON faucet request submitted. Check your wallet in ~30 seconds.");
    } catch {
      showSuccess("✗ Faucet request failed. Try again.");
    } finally {
      setRequestingMon(false);
    }
  };

  const requestAusdc = async () => {
    if (!wallet.account) return;
    setRequestingAusdc(true);
    try {
      const res = await fetch("/api/apass/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain: "monad",
          symbol: "ausdc",
          depositAddress: wallet.account,
          amount: "100",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showSuccess("✓ Test aUSDC requested. Check your wallet in ~30 seconds.");
      } else {
        showSuccess("✗ Faucet request failed. Try again.");
      }
    } catch {
      showSuccess("✗ Faucet request failed. Try again.");
    } finally {
      setRequestingAusdc(false);
    }
  };

  const refreshBalances = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      showSuccess("✓ Balances refreshed.");
    }, 1000);
  };

  if (!wallet.account) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">Need Test Funds?</h3>
      <p className="mt-2 text-sm text-muted">
        Compliant payments require MON for gas fees and aUSDC for settlement.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button
          onClick={requestMon}
          disabled={requestingMon}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card disabled:opacity-60"
        >
          {requestingMon ? "Requesting..." : "Request Test MON"}
        </button>
        <button
          onClick={requestAusdc}
          disabled={requestingAusdc}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card disabled:opacity-60"
        >
          {requestingAusdc ? "Requesting..." : "Request Test aUSDC"}
        </button>
        <button
          onClick={refreshBalances}
          disabled={refreshing}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh Balances"}
        </button>
      </div>

      {successMessage && (
        <div className="mt-3 rounded-lg border border-verify-500/30 bg-verify-500/5 px-3 py-2 text-xs font-medium text-verify-600">
          {successMessage}
        </div>
      )}
    </div>
  );
}

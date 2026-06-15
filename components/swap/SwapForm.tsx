"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/components/pay/useWallet";
import { SWAP_TOKENS, type SwapToken } from "@/lib/swap/config";
import {
  MONAD_MAINNET,
  ensureChain,
  formatUnits,
  sendTransaction,
  waitForReceipt,
} from "@/lib/web3/monad";

interface PriceState {
  buyAmount: string;
  minBuyAmount?: string;
  sources: string[];
  buyDecimals: number;
}

type Phase = "idle" | "swapping" | "confirming" | "done" | "error";

export function SwapForm() {
  const wallet = useWallet();
  const sell = SWAP_TOKENS[0]; // MON
  const buy = SWAP_TOKENS.find((t) => t.symbol === "USDC") as SwapToken;

  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState<PriceState | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const amt = Number(amount);
  const ready = !!wallet.account && amt > 0 && !!buy.address;

  // Live indicative price as the user types.
  useEffect(() => {
    if (!ready) {
      setPrice(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sellSymbol: sell.symbol,
            buySymbol: buy.symbol,
            sellAmount: amount,
            taker: wallet.account,
            mode: "price",
          }),
        });
        const j = await res.json();
        if (cancelled) return;
        if (j.notConfigured) {
          setNotConfigured(true);
          setPrice(null);
        } else if (j.ok) {
          setNotConfigured(false);
          setPrice({
            buyAmount: j.quote.buyAmount,
            minBuyAmount: j.quote.minBuyAmount,
            sources: j.quote.sources ?? [],
            buyDecimals: j.buy.decimals,
          });
        } else {
          setError(j.error ?? "No quote");
          setPrice(null);
        }
      } catch {
        if (!cancelled) setError("Couldn’t fetch a quote.");
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount, ready, wallet.account, sell.symbol, buy.symbol]);

  const doSwap = useCallback(async () => {
    if (!wallet.account) return;
    setPhase("swapping");
    setError(null);
    setTxHash(null);
    try {
      // 1. Firm quote with calldata.
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellSymbol: sell.symbol,
          buySymbol: buy.symbol,
          sellAmount: amount,
          taker: wallet.account,
          mode: "quote",
        }),
      });
      const j = await res.json();
      if (j.notConfigured) {
        setNotConfigured(true);
        setPhase("idle");
        return;
      }
      if (!j.ok || !j.quote?.transaction) {
        throw new Error(j.error ?? "No executable quote available.");
      }

      // 2. Ensure wallet is on Monad mainnet, then send the 0x calldata.
      await ensureChain(MONAD_MAINNET);
      const hash = await sendTransaction({
        from: wallet.account,
        to: j.quote.transaction.to,
        data: j.quote.transaction.data,
        value: j.quote.transaction.value,
        gas: j.quote.transaction.gas,
      });
      setTxHash(hash);
      setPhase("confirming");

      // 3. Wait for confirmation.
      const receipt = await waitForReceipt(hash);
      if (!receipt.success) throw new Error("Swap transaction reverted.");
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Swap failed.");
      setPhase("error");
    }
  }, [wallet.account, amount, sell.symbol, buy.symbol]);

  const buyDisplay =
    price && Number(amount) > 0
      ? formatUnits(price.buyAmount, price.buyDecimals)
      : "";
  const rate =
    price && Number(amount) > 0
      ? (Number(buyDisplay) / Number(amount)).toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })
      : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Swap</h2>
      <p className="mb-4 text-xs text-muted">
        Best price across Monad DEXs via 0x. Swap MON for USDC to fund a payment.
      </p>

      {/* Sell */}
      <div className="rounded-xl border border-border bg-background/50 p-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>You pay</span>
          <span>Monad</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            inputMode="decimal"
            placeholder="0.0"
            className="w-full bg-transparent text-2xl font-semibold text-foreground outline-none"
          />
          <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-sm font-semibold text-purple-600 ring-1 ring-purple-500/30">
            MON
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div className="my-1 flex justify-center">
        <span className="grid size-7 place-items-center rounded-lg border border-border bg-card text-muted">
          ↓
        </span>
      </div>

      {/* Buy */}
      <div className="rounded-xl border border-border bg-background/50 p-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>You receive {quoting && "· quoting…"}</span>
          <span>Monad</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input
            value={buyDisplay}
            readOnly
            placeholder="0.0"
            className="w-full bg-transparent text-2xl font-semibold text-foreground outline-none"
          />
          <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-semibold text-blue-600 ring-1 ring-blue-500/30">
            USDC
          </span>
        </div>
      </div>

      {/* Quote details */}
      {price && Number(amount) > 0 && (
        <div className="mt-3 space-y-1 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-muted">
          <div className="flex justify-between">
            <span>Rate</span>
            <span className="text-foreground">1 MON ≈ {rate} USDC</span>
          </div>
          {price.minBuyAmount && (
            <div className="flex justify-between">
              <span>Min received (1% slippage)</span>
              <span className="text-foreground">
                {formatUnits(price.minBuyAmount, price.buyDecimals)} USDC
              </span>
            </div>
          )}
          {price.sources.length > 0 && (
            <div className="flex justify-between">
              <span>Route</span>
              <span className="text-foreground">{price.sources.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Not configured notice */}
      {notConfigured && (
        <div className="mt-3 rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-xs text-muted">
          Swaps aren’t live yet — a <code className="font-mono">ZEROX_API_KEY</code>{" "}
          and Monad mainnet token addresses need to be configured. The integration
          is ready; add the key to activate.
        </div>
      )}

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      {/* Action */}
      <div className="mt-4">
        {!wallet.account ? (
          <button
            onClick={wallet.connect}
            disabled={wallet.connecting || !wallet.hasWallet}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {!wallet.hasWallet
              ? "No wallet detected"
              : wallet.connecting
                ? "Connecting…"
                : "Connect wallet"}
          </button>
        ) : phase === "done" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-verify-500/30 bg-verify-500/5 px-4 py-3 text-sm">
              <svg viewBox="0 0 24 24" className="size-5 text-verify-600" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-foreground">Swap complete — USDC received.</span>
            </div>
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center rounded-xl bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              Continue to checkout →
            </Link>
          </div>
        ) : (
          <button
            onClick={doSwap}
            disabled={!ready || phase === "swapping" || phase === "confirming"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {phase === "swapping"
              ? "Confirm in wallet…"
              : phase === "confirming"
                ? "Swapping…"
                : `Swap MON for USDC`}
          </button>
        )}
        {txHash && (
          <a
            href={MONAD_MAINNET.explorerTx(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center font-mono text-[11px] text-brand-500 hover:underline"
          >
            View transaction ↗
          </a>
        )}
      </div>
    </div>
  );
}

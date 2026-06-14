"use client";

import { useCallback, useState } from "react";
import type { Chain, Persona } from "@/lib/cleanverse/types";
import { PERSONAS } from "@/lib/cleanverse/mock";
import { CHAINS, fmtUsd, isLikelyAddress, shortAddr } from "@/lib/demo";
import {
  ensureChain,
  monadConfig,
  sendAtokenTransfer,
  settlementAtoken,
  waitForReceipt,
} from "@/lib/web3/monad";
import { VeriGateMark } from "@/components/Logo";
import { PayModal } from "./PayModal";
import { useWallet } from "./useWallet";

const PERSONA_ORDER: Persona[] = ["verified", "no-apass", "frozen", "low-tier"];

const SAMPLE_WALLETS: { label: string; address: string }[] = [
  { label: "A-Pass wallet", address: "0x888895E314BF33CEeBCF5320279061aed3a5E2bd" },
  { label: "No A-Pass", address: "0x9bD2A7c41E0fF5630aB81C229d4477e5e2C1a8F0" },
];

export function PayWithVeriGate({
  amount,
  currency,
  merchant,
  mode = "mock",
}: {
  amount: number;
  currency: string;
  merchant: string;
  mode?: "mock" | "live";
}) {
  const live = mode === "live";
  const wallet = useWallet();
  const [chain, setChain] = useState<Chain>("monad");
  const [persona, setPersona] = useState<Persona>("verified");
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);

  // Customer = connected wallet (live) > manual address (live) > persona (mock).
  const customer = live
    ? wallet.account ?? address.trim()
    : PERSONAS[persona].address;

  // Real on-chain settlement only when a wallet is connected and chain is Monad.
  const canSettleReal = live && !!wallet.account && chain === "monad";
  const canPay = live ? !!customer && (wallet.account ? true : isLikelyAddress(chain, address)) : true;

  const settleOnChain = useCallback(async () => {
    const cfg = monadConfig();
    await ensureChain(cfg);
    const { address: token, decimals } = settlementAtoken();
    const txHash = await sendAtokenTransfer({
      from: wallet.account!,
      token,
      to: merchant,
      amount,
      decimals,
    });
    const receipt = await waitForReceipt(txHash);
    if (!receipt.success) {
      throw new Error(
        "Transfer reverted on-chain — compliance check failed or insufficient A-Token balance.",
      );
    }
    return { txHash, blockNumber: receipt.blockNumber };
  }, [wallet.account, merchant, amount]);

  return (
    <div className="space-y-4">
      {/* Demo / live controls */}
      <div className="rounded-xl border border-dashed border-brand-300/60 bg-brand-50/50 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
          {live ? "Live · sandbox" : "Demo controls"}
        </p>

        {live ? (
          <>
            {/* Wallet connect */}
            {wallet.account ? (
              <div className="flex items-center justify-between rounded-lg border border-verify-500/30 bg-verify-500/5 px-2.5 py-2">
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="size-2 rounded-full bg-verify-500" />
                  <span className="font-mono text-foreground">
                    {shortAddr(wallet.account)}
                  </span>
                </span>
                <span className="text-[10.5px] font-medium text-verify-600">
                  Wallet connected
                </span>
              </div>
            ) : wallet.hasWallet ? (
              <button
                onClick={wallet.connect}
                disabled={wallet.connecting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-400 bg-card px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:opacity-60"
              >
                {wallet.connecting ? "Connecting…" : "Connect wallet"}
              </button>
            ) : (
              <p className="rounded-lg border border-border bg-card px-2.5 py-2 text-[11px] text-muted">
                No browser wallet detected. Install MetaMask to settle on Monad,
                or paste an address below to check its A-Pass.
              </p>
            )}

            {/* Manual address fallback (read-only checks when no wallet) */}
            {!wallet.account && (
              <div className="mt-2">
                <label className="text-xs text-muted">
                  Or check any wallet address
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={chain === "solana" ? "Solana address…" : "0x…"}
                  spellCheck={false}
                  autoComplete="off"
                  className={`mt-1 w-full rounded-lg border bg-card px-2.5 py-2 font-mono text-xs text-foreground outline-none transition focus:ring-2 ${
                    address && !isLikelyAddress(chain, address)
                      ? "border-danger/50 focus:ring-danger/30"
                      : "border-border focus:ring-brand-300"
                  }`}
                />
                <div className="mt-1.5 flex justify-end gap-1">
                  {SAMPLE_WALLETS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setAddress(s.address)}
                      className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-600 hover:bg-brand-200"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <label className="text-xs text-muted">Test identity</label>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {PERSONA_ORDER.map((p) => {
                const sel = p === persona;
                return (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                      sel
                        ? "border-brand-500 bg-brand-500/10 text-foreground"
                        : "border-border bg-card text-muted hover:border-brand-300"
                    }`}
                  >
                    <span className="block font-medium text-foreground">
                      {PERSONAS[p].label}
                    </span>
                    <span className="block text-[10.5px] leading-tight text-muted">
                      {PERSONAS[p].description}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Chain */}
        <label className="mt-3 block text-xs text-muted">Network</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {CHAINS.map((c) => {
            const sel = c.id === chain;
            return (
              <button
                key={c.id}
                onClick={() => setChain(c.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 transition ${
                  sel ? c.tint : "bg-card text-muted ring-border hover:ring-brand-300"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {wallet.error && (
          <p className="mt-2 text-[11px] text-danger">{wallet.error}</p>
        )}
      </div>

      {/* Settlement mode hint */}
      {live && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-[11px]">
          <span
            className={`size-2 rounded-full ${canSettleReal ? "bg-verify-500" : "bg-warn"}`}
          />
          <span className="text-muted">
            {canSettleReal
              ? `Real settlement on ${monadConfig().name}`
              : wallet.account
                ? "Connect on Monad for real settlement (other chains simulate)"
                : "Simulated settlement — connect a wallet on Monad to settle for real"}
          </span>
        </div>
      )}

      {/* The button */}
      <button
        onClick={() => setOpen(true)}
        disabled={!canPay}
        className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        <VeriGateMark size={20} />
        Pay {fmtUsd(amount)} with VeriGate
      </button>
      <p className="text-center text-[11px] text-muted">
        Verified &amp; auditable · no funds move until every check passes
      </p>

      {canPay && (
        <PayModal
          open={open}
          onClose={() => setOpen(false)}
          chain={chain}
          persona={live ? "verified" : persona}
          customer={customer}
          merchant={merchant}
          amount={amount}
          currency={currency}
          mode={mode}
          settleOnChain={canSettleReal ? settleOnChain : undefined}
        />
      )}
    </div>
  );
}

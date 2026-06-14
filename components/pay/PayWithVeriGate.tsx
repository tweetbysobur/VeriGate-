"use client";

import { useState } from "react";
import type { Chain, Persona } from "@/lib/cleanverse/types";
import { PERSONAS } from "@/lib/cleanverse/mock";
import { CHAINS, fmtUsd, isLikelyAddress, shortAddr } from "@/lib/demo";
import { VeriGateMark } from "@/components/Logo";
import { PayModal } from "./PayModal";

const PERSONA_ORDER: Persona[] = ["verified", "no-apass", "frozen", "low-tier"];

/** Known sandbox wallets for one-click live testing. */
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
  const [chain, setChain] = useState<Chain>("monad");
  const [persona, setPersona] = useState<Persona>("verified");
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);

  const customer = live ? address.trim() : PERSONAS[persona].address;
  const canPay = live ? isLikelyAddress(chain, address) : true;

  return (
    <div className="space-y-4">
      {/* Demo controls */}
      <div className="rounded-xl border border-dashed border-brand-300/60 bg-brand-50/50 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
          {live ? "Live · sandbox" : "Demo controls"}
        </p>

        {live ? (
          /* ---- Live: real wallet address input ---- */
          <>
            <label className="text-xs text-muted">Customer wallet address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={chain === "solana" ? "Solana address…" : "0x… (40 hex)"}
              spellCheck={false}
              autoComplete="off"
              className={`mt-1 w-full rounded-lg border bg-card px-2.5 py-2 font-mono text-xs text-foreground outline-none transition focus:ring-2 ${
                address && !canPay
                  ? "border-danger/50 focus:ring-danger/30"
                  : "border-border focus:ring-brand-300"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[10.5px] text-muted">
                {address && !canPay
                  ? "Doesn’t look like a valid address for this chain"
                  : "Its real A-Pass status is checked live"}
              </span>
              <span className="flex gap-1">
                {SAMPLE_WALLETS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setAddress(s.address)}
                    className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-600 hover:bg-brand-200"
                  >
                    {s.label}
                  </button>
                ))}
              </span>
            </div>
          </>
        ) : (
          /* ---- Mock: persona selector ---- */
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
      </div>

      {/* Connected wallet preview */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2.5 text-xs">
        <span className="text-muted">Wallet</span>
        {customer ? (
          <span className="inline-flex items-center gap-2 font-mono text-foreground">
            <span className={`size-2 rounded-full ${canPay ? "bg-verify-500" : "bg-warn"}`} />
            {shortAddr(customer)}
          </span>
        ) : (
          <span className="text-muted">Enter an address above</span>
        )}
      </div>

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
        />
      )}
    </div>
  );
}

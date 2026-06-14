"use client";

import { useState } from "react";
import type { Chain, Persona } from "@/lib/cleanverse/types";
import { PERSONAS } from "@/lib/cleanverse/mock";
import { CHAINS, fmtUsd, shortAddr } from "@/lib/demo";
import { VeriGateMark } from "@/components/Logo";
import { PayModal } from "./PayModal";

const PERSONA_ORDER: Persona[] = ["verified", "no-apass", "frozen", "low-tier"];

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
  const [chain, setChain] = useState<Chain>("base");
  const [persona, setPersona] = useState<Persona>("verified");
  const [open, setOpen] = useState(false);

  const profile = PERSONAS[persona];

  return (
    <div className="space-y-4">
      {/* Demo controls */}
      <div className="rounded-xl border border-dashed border-brand-300/60 bg-brand-50/50 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
          Demo controls
        </p>

        {/* Identity / persona */}
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
        <span className="inline-flex items-center gap-2 font-mono text-foreground">
          <span className="size-2 rounded-full bg-verify-500" />
          {shortAddr(profile.address)}
        </span>
      </div>

      {/* The button */}
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 active:scale-[0.99]"
      >
        <VeriGateMark size={20} />
        Pay {fmtUsd(amount)} with VeriGate
      </button>
      <p className="text-center text-[11px] text-muted">
        Verified &amp; auditable · no funds move until every check passes
      </p>

      <PayModal
        open={open}
        onClose={() => setOpen(false)}
        chain={chain}
        persona={persona}
        customer={profile.address}
        merchant={merchant}
        amount={amount}
        currency={currency}
        mode={mode}
      />
    </div>
  );
}

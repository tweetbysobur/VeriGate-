"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Chain, PaymentStepId, Persona } from "@/lib/cleanverse/types";
import { chainMeta, fmtUsd, shortAddr } from "@/lib/demo";
import { Logo } from "@/components/Logo";
import { Receipt, type ReceiptData } from "./Receipt";
import { StepRow } from "./StepRow";
import {
  STEP_DEFS,
  callStep,
  initialSteps,
  type StepState,
} from "./pipeline";

type Phase = "review" | "running" | "success" | "failed";

/** Fire-and-forget: record the payment outcome to the merchant ledger. */
function recordAttempt(body: {
  customer: string;
  chain: Chain;
  amount: number;
  currency: string;
  status: "settled" | "blocked";
  blockReason?: string;
  apassTier?: string;
  txHash?: string;
  receipt?: { fileName: string; downloadUrl: string };
}) {
  fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

interface Props {
  open: boolean;
  onClose: () => void;
  chain: Chain;
  persona: Persona;
  customer: string;
  merchant: string;
  amount: number;
  currency: string;
  mode?: "mock" | "live";
  /** When set, the settle step performs a real on-chain transfer via the wallet. */
  settleOnChain?: () => Promise<{ txHash: string; blockNumber?: number }>;
}

export function PayModal({
  open,
  onClose,
  chain,
  persona,
  customer,
  merchant,
  amount,
  currency,
  mode = "mock",
  settleOnChain,
}: Props) {
  const realSettle = typeof settleOnChain === "function";
  const [phase, setPhase] = useState<Phase>("review");
  const [steps, setSteps] = useState<StepState[]>(initialSteps);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [netError, setNetError] = useState<string | null>(null);
  const runningRef = useRef(false);
  const meta = chainMeta(chain);

  const reset = useCallback(() => {
    setPhase("review");
    setSteps(initialSteps());
    setReceipt(null);
    setNetError(null);
    runningRef.current = false;
  }, []);

  // Reset whenever the modal is (re)opened.
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  // Close on Escape (except mid-run).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "running") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  const patch = (id: PaymentStepId, next: Partial<StepState>) =>
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...next } : s)),
    );

  async function run() {
    if (runningRef.current) return;
    runningRef.current = true;
    setNetError(null);
    setPhase("running");
    setSteps(initialSteps());

    let txHash = "0x0";
    let apassTier: string | undefined;
    let report: { fileName: string; downloadUrl: string } | undefined;
    try {
      for (const def of STEP_DEFS) {
        // Real on-chain settlement via the connected wallet (Monad).
        if (def.id === "settle" && realSettle && settleOnChain) {
          patch("settle", {
            status: "running",
            title: "Settling on Monad",
            detail: "Confirm the transfer in your wallet…",
            source: "live",
          });
          try {
            const res = await settleOnChain();
            txHash = res.txHash;
            patch("settle", {
              status: "passed",
              title: "Settled on Monad",
              detail: `A-Token transferred${res.blockNumber ? ` · block ${res.blockNumber.toLocaleString()}` : ""}`,
              source: "live",
              payload: { txHash: res.txHash, blockNumber: res.blockNumber },
            });
          } catch (e) {
            patch("settle", {
              status: "failed",
              title: "Settlement failed",
              detail:
                e instanceof Error ? e.message : "Wallet transaction failed.",
              source: "live",
            });
            setPhase("failed");
            runningRef.current = false;
            return;
          }
          continue;
        }

        patch(def.id, { status: "running" });
        const out = await callStep({
          step: def.id,
          chain,
          persona,
          address: customer,
          amount: String(amount),
          merchant,
          txHash,
          realSettle,
        });

        if (def.id === "settle" && out.txHash) txHash = out.txHash;

        if (!out.ok) {
          patch(def.id, {
            status: "failed",
            title: out.title,
            detail: out.detail,
            payload: out.payload,
            source: out.source,
            action: out.action,
          });
          recordAttempt({
            customer,
            chain,
            amount,
            currency,
            status: "blocked",
            blockReason: out.title,
            apassTier,
          });
          setPhase("failed");
          runningRef.current = false;
          return;
        }

        if (def.id === "identity") {
          apassTier = out.detail.match(/tier (\d+)/i)?.[1];
        }

        patch(def.id, {
          status: "passed",
          title: out.title,
          detail: out.detail,
          payload: out.payload,
          source: out.source,
        });

        if (def.id === "audit" && out.report) {
          report = out.report;
          setReceipt({
            amount,
            currency,
            chain,
            customer,
            merchant,
            txHash,
            report: out.report,
            apassTier,
            assetSymbol: "aUSDC",
          });
        }
      }
      recordAttempt({
        customer,
        chain,
        amount,
        currency,
        status: "settled",
        apassTier,
        txHash: txHash !== "0x0" ? txHash : undefined,
        receipt: report,
      });
      setPhase("success");
    } catch (err) {
      setNetError(err instanceof Error ? err.message : "Network error");
      setPhase("failed");
    } finally {
      runningRef.current = false;
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => phase !== "running" && onClose()}
    >
      <div
        className="vg-rise flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl ring-1 ring-border sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo size={24} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-verify-500/10 px-2.5 py-1 text-[11px] font-medium text-verify-600 ring-1 ring-verify-500/20">
            <span className="size-1.5 rounded-full bg-verify-500" />
            Secured checkout
          </span>
        </div>

        {/* Amount summary */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-background/50 px-5 py-3">
          <div>
            <p className="text-xs text-muted">Paying {merchant && shortAddr(merchant)}</p>
            <p className="text-xl font-semibold text-foreground">
              {fmtUsd(amount)}{" "}
              <span className="text-sm font-normal text-muted">{currency}</span>
            </p>
          </div>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${meta.tint}`}
          >
            {meta.name}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {phase === "review" ? (
            <ReviewPanel customer={customer} chain={chain} />
          ) : phase === "success" && receipt ? (
            <Receipt data={receipt} />
          ) : (
            <>
              <ol className="mt-1">
                {STEP_DEFS.map((def, i) => (
                  <StepRow
                    key={def.id}
                    def={def}
                    state={steps[i]}
                    isLast={i === STEP_DEFS.length - 1}
                  />
                ))}
              </ol>
              {phase === "failed" && (
                <div className="vg-rise rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm">
                  <p className="font-medium text-danger">
                    {netError ? "Couldn’t complete payment" : "Payment blocked by compliance"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {netError ??
                      "No funds moved. VeriGate stops a payment the moment a check fails — nothing settles unless every gate passes."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border px-5 py-4">
          {phase === "review" && (
            <button
              onClick={run}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Pay {fmtUsd(amount)} with VeriGate
            </button>
          )}
          {phase === "running" && (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500/60 py-3 text-sm font-semibold text-white"
            >
              <span className="size-4 rounded-full border-2 border-white/40 border-t-white vg-spin" />
              Verifying &amp; settling…
            </button>
          )}
          {phase === "failed" && (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-background"
              >
                Cancel
              </button>
              <button
                onClick={run}
                className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Try again
              </button>
            </div>
          )}
          {phase === "success" && (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              Done
            </button>
          )}
          <p className="mt-3 text-center text-[11px] text-muted">
            Powered by Cleanverse A-Pass + A-Token ·{" "}
            <span className="font-mono">
              {mode === "live" ? "live · sandbox" : "demo mode"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewPanel({ customer, chain }: { customer: string; chain: Chain }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        VeriGate will run five compliance gates before any money moves:
      </p>
      <ul className="space-y-2">
        {STEP_DEFS.map((s, i) => (
          <li key={s.id} className="flex items-start gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted">{s.blurb}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="rounded-xl border border-border bg-background/50 px-4 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted">Paying from</span>
          <span className="font-mono text-foreground">{shortAddr(customer)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-muted">Network</span>
          <span className="font-medium text-foreground">{chainMeta(chain).name}</span>
        </div>
      </div>
    </div>
  );
}

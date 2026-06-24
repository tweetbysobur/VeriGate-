"use client";

import Link from "next/link";
import { chainMeta, fmtUsd, shortAddr } from "@/lib/demo";
import type { Chain } from "@/lib/cleanverse/types";
import { SettlementProof } from "./SettlementProof";

export interface ReceiptData {
  amount: number;
  currency: string;
  chain: Chain;
  customer: string;
  merchant: string;
  txHash: string;
  report: { downloadUrl: string; fileName: string };
  /** Compliance proof surfaced on the receipt. */
  apassTier?: string;
  assetSymbol?: string;
  /** When set, links to the permanent receipt page /receipt/[invoiceId]. */
  invoiceId?: string;
  /** True only for a real on-chain settlement (controls the explorer link). */
  onChain?: boolean;
  blockNumber?: number;
  settledAt?: number;
}

function fullReceiptHref(data: ReceiptData): string {
  // Always carry params so the receipt renders even on a cold serverless
  // instance that never saw the invoice (the page tries the store first, then
  // falls back to these). Use the invoice id as the path id when available.
  const id = data.invoiceId ?? "r";
  const q = new URLSearchParams({
    amt: String(data.amount),
    cur: data.currency,
    cust: data.customer,
    chain: data.chain,
    ...(data.apassTier ? { tier: data.apassTier } : {}),
    ...(data.txHash && data.txHash !== "0x0" ? { tx: data.txHash } : {}),
    ...(data.onChain ? { oc: "1" } : {}),
    ...(data.report?.downloadUrl
      ? { file: data.report.fileName, url: data.report.downloadUrl }
      : {}),
  });
  return `/receipt/${id}?${q.toString()}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

export function Receipt({ data }: { data: ReceiptData }) {
  const meta = chainMeta(data.chain);
  return (
    <div className="vg-rise rounded-2xl border-2 border-verify-500/30 bg-verify-500/5 p-6">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-full bg-verify-500 text-white vg-pop shadow-lg">
          <svg viewBox="0 0 24 24" className="vg-check size-8" fill="none">
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="mt-4 text-2xl font-bold text-verify-600">
          ✓ Payment Complete
        </h3>
        <p className="mt-2 text-base font-semibold text-foreground">
          {fmtUsd(data.amount)} {data.currency} settled
        </p>
        <p className="mt-1 text-sm text-muted">
          Settled on Monad via the VeriGate Settlement Contract · fully auditable
        </p>
      </div>

      {/* Compliance proof — what was checked before money moved */}
      <div className="mt-5 rounded-xl border border-verify-500/25 bg-verify-500/5 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-verify-600">
          Compliance proof
        </p>
        <ul className="space-y-1.5">
          {[
            `Identity verified — A-Pass${data.apassTier ? ` · tier ${data.apassTier}` : ""}`,
            `Compliant asset — ${data.assetSymbol ?? "A-Token"} provenance tracked`,
            "Transaction screened against the A-Token compliance rule",
            "Auditable Travel Rule receipt written",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-xs text-foreground">
              <svg viewBox="0 0 24 24" className="mt-0.5 size-3.5 shrink-0 text-verify-500" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-background/60 px-4">
        {data.invoiceId && (
          <Field label="Invoice ID">
            <span className="font-mono text-xs">{data.invoiceId}</span>
          </Field>
        )}
        <Field label="Amount">
          {fmtUsd(data.amount)} {data.currency}
        </Field>
        <Field label="Network">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${meta.tint}`}
          >
            {meta.name}
          </span>
        </Field>
        <Field label="Customer wallet">
          <span className="font-mono text-xs">{shortAddr(data.customer)}</span>
        </Field>
        <Field label="Merchant wallet">
          <span className="font-mono text-xs">{shortAddr(data.merchant)}</span>
        </Field>
        <Field label="A-Pass status">
          <span className="text-verify-600">
            Verified{data.apassTier ? ` · tier ${data.apassTier}` : ""}
          </span>
        </Field>
        <Field label="Compliance status">
          <span className="text-verify-600">Passed</span>
        </Field>
      </div>

      <div className="mt-3">
        <SettlementProof
          txHash={data.txHash}
          blockNumber={data.blockNumber}
          timestamp={data.settledAt}
          status={data.onChain && data.txHash && data.txHash !== "0x0" ? "confirmed" : "pending"}
        />
      </div>

      {/* Audit receipt download (or pending state) */}
      {data.report.downloadUrl ? (
        <a
          href={data.report.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 rounded-xl border border-verify-500/30 bg-verify-500/5 px-4 py-3 transition hover:bg-verify-500/10"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-verify-500/15 text-verify-600">
            <svg viewBox="0 0 24 24" className="size-5" fill="none">
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              Download Travel Rule receipt
            </span>
            <span className="block truncate font-mono text-[11px] text-muted">
              {data.report.fileName}
            </span>
          </span>
        </a>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-600">
            <span className="size-4 rounded-full border-2 border-brand-300 border-t-brand-500 vg-spin" />
          </span>
          <span className="text-sm text-muted">
            Travel Rule receipt pending — available shortly via the transaction.
          </span>
        </div>
      )}

      <Link
        href={fullReceiptHref(data)}
        target="_blank"
        className="mt-2 block text-center text-xs font-medium text-brand-500 hover:underline"
      >
        View full receipt ↗
      </Link>
    </div>
  );
}

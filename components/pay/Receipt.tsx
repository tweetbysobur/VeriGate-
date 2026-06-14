"use client";

import { chainMeta, fmtUsd, shortAddr } from "@/lib/demo";
import type { Chain } from "@/lib/cleanverse/types";

export interface ReceiptData {
  amount: number;
  currency: string;
  chain: Chain;
  customer: string;
  merchant: string;
  txHash: string;
  report: { downloadUrl: string; fileName: string };
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
    <div className="vg-rise">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-verify-500 text-white vg-pop">
          <svg viewBox="0 0 24 24" className="vg-check size-7" fill="none">
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="mt-3 text-lg font-semibold text-foreground">
          Payment verified &amp; settled
        </h3>
        <p className="mt-1 text-sm text-muted">
          {fmtUsd(data.amount)} {data.currency} · compliant &amp; auditable
        </p>
      </div>

      <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-background/60 px-4">
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
        <Field label="From (customer)">
          <span className="font-mono text-xs">{shortAddr(data.customer)}</span>
        </Field>
        <Field label="To (merchant)">
          <span className="font-mono text-xs">{shortAddr(data.merchant)}</span>
        </Field>
        <Field label="Transaction">
          <a
            href={meta.explorerTx(data.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-brand-500 hover:underline"
          >
            {shortAddr(data.txHash, 8, 6)} ↗
          </a>
        </Field>
      </div>

      {/* Audit receipt download */}
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
    </div>
  );
}

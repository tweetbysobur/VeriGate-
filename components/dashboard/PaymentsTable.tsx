"use client";

import { useState } from "react";
import Link from "next/link";
import type { PaymentRecord, PaymentStatus } from "@/lib/cleanverse/types";
import { chainMeta, fmtUsd, shortAddr, timeAgo } from "@/lib/demo";

type Filter = "all" | PaymentStatus;

/** Receipt link that carries params, so it renders even on a cold instance. */
function receiptHref(p: PaymentRecord): string {
  const q = new URLSearchParams({
    amt: String(p.amount),
    cur: p.currency,
    cust: p.customer,
    chain: p.chain,
    ...(p.apassTier ? { tier: p.apassTier } : {}),
    ...(p.txHash ? { tx: p.txHash } : {}),
    ...(p.onChain ? { oc: "1" } : {}),
    ...(p.receipt
      ? { file: p.receipt.fileName, url: p.receipt.downloadUrl }
      : {}),
  });
  return `/receipt/${p.id}?${q.toString()}`;
}

function StatusBadge({ p }: { p: PaymentRecord }) {
  if (p.status === "settled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-verify-500/10 px-2 py-0.5 text-[11px] font-semibold text-verify-600 ring-1 ring-verify-500/20">
        <span className="size-1.5 rounded-full bg-verify-500" />
        Settled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger ring-1 ring-danger/20">
      <span className="size-1.5 rounded-full bg-danger" />
      Blocked
    </span>
  );
}

function exportCsv(rows: PaymentRecord[]) {
  const header = [
    "id",
    "timestamp_utc",
    "status",
    "customer",
    "apass_tier",
    "block_reason",
    "amount",
    "currency",
    "chain",
    "tx_hash",
    "receipt",
  ];
  const lines = rows.map((p) =>
    [
      p.id,
      new Date(p.createdAt * 1000).toISOString(),
      p.status,
      p.customer,
      p.apassTier ?? "",
      p.blockReason ?? "",
      p.amount,
      p.currency,
      p.chain,
      p.txHash ?? "",
      p.receipt?.fileName ?? "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `verigate-settlement-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PaymentsTable({ payments }: { payments: PaymentRecord[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = payments.filter((p) => filter === "all" || p.status === filter);

  const counts = {
    all: payments.length,
    settled: payments.filter((p) => p.status === "settled").length,
    blocked: payments.filter((p) => p.status === "blocked").length,
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Compliance &amp; settlement log</h2>
          <p className="text-[11px] text-muted">Auditable record of every payment attempt</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-background p-0.5">
            {(["all", "settled", "blocked"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition ${
                  filter === f
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {f} <span className="text-muted">{counts[f]}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => exportCsv(rows)}
            className="hidden items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-background sm:inline-flex"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="divide-y divide-border sm:hidden">
        {rows.map((p) => {
          const meta = chainMeta(p.chain);
          return (
            <li key={p.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-foreground">{p.id}</p>
                  <p className="text-[11px] text-muted">{timeAgo(p.createdAt)}</p>
                </div>
                <StatusBadge p={p} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted">
                  {p.customer.includes("…") ? p.customer : shortAddr(p.customer)}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {fmtUsd(p.amount)}
                  <span className="ml-1 text-[11px] font-normal text-muted">{p.currency}</span>
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ${meta.tint}`}>
                    {meta.name}
                  </span>
                  {p.status === "settled" ? (
                    <span className="text-[11px] text-muted">
                      A-Pass{p.apassTier ? ` · t${p.apassTier}` : ""}
                    </span>
                  ) : (
                    <span className="text-[11px] text-danger">{p.blockReason}</span>
                  )}
                </span>
                {p.status === "settled" && (
                  <Link
                    href={receiptHref(p)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline"
                  >
                    Receipt ↗
                  </Link>
                )}
              </div>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted">No {filter} payments.</li>
        )}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5 font-medium">Payment</th>
              <th className="px-4 py-2.5 font-medium">Customer</th>
              <th className="px-4 py-2.5 font-medium">Identity</th>
              <th className="px-4 py-2.5 font-medium">Network</th>
              <th className="px-4 py-2.5 text-right font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => {
              const meta = chainMeta(p.chain);
              return (
                <tr key={p.id} className="hover:bg-background/50">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-foreground">{p.id}</div>
                    <div className="text-[11px] text-muted">{timeAgo(p.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {p.customer.includes("…") ? p.customer : shortAddr(p.customer)}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "settled" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground">
                        <svg viewBox="0 0 24 24" className="size-3.5 text-verify-500" fill="none">
                          <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        A-Pass{p.apassTier ? ` · t${p.apassTier}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-danger">{p.blockReason}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ${meta.tint}`}>
                      {meta.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {fmtUsd(p.amount)}
                    <span className="ml-1 text-[11px] font-normal text-muted">{p.currency}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge p={p} />
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "settled" ? (
                      <Link
                        href={receiptHref(p)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline"
                      >
                        Receipt ↗
                      </Link>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                  No {filter} payments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

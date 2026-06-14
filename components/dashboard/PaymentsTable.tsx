"use client";

import { useState } from "react";
import type { PaymentRecord, PaymentStatus } from "@/lib/cleanverse/types";
import { chainMeta, fmtUsd, shortAddr, timeAgo } from "@/lib/demo";

type Filter = "all" | PaymentStatus;

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
        <h2 className="text-sm font-semibold text-foreground">Payments</h2>
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
              {f}{" "}
              <span className="text-muted">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
                    {p.receipt ? (
                      <a
                        href={p.receipt.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline"
                      >
                        <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                          <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        PDF
                      </a>
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

"use client";

import { useEffect, useState } from "react";
import type { PaymentRecord } from "@/lib/cleanverse/types";
import { listLocal } from "@/lib/localLedger";
import { fmtUsd } from "@/lib/demo";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "brand" | "verify" | "danger";
}) {
  const ring =
    accent === "verify"
      ? "text-verify-600"
      : accent === "danger"
        ? "text-danger"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${ring}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

export function LedgerStats() {
  const [list, setList] = useState<PaymentRecord[]>([]);
  useEffect(() => setList(listLocal()), []);

  const settled = list.filter((x) => x.status === "settled");
  const blocked = list.filter((x) => x.status === "blocked");
  const volume = settled.reduce((s, x) => s + x.amount, 0);
  const rate = list.length ? Math.round((settled.length / list.length) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Settled volume" value={fmtUsd(volume)} sub="Your payments" />
      <StatCard
        label="Payments settled"
        value={String(settled.length)}
        sub="Verified & auditable"
        accent="verify"
      />
      <StatCard
        label="Blocked attempts"
        value={String(blocked.length)}
        sub="Stopped pre-settlement"
        accent="danger"
      />
      <StatCard
        label="Verified rate"
        value={`${rate}%`}
        sub="Settled ÷ total"
        accent="brand"
      />
    </div>
  );
}

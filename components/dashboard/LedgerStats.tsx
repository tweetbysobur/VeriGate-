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
  const total = list.length;
  const received = settled.length > 0 ? fmtUsd(volume) : "$0.00";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total volume" value={fmtUsd(volume)} sub="All settled payments" />
      <StatCard
        label="Total transactions"
        value={String(total)}
        sub="Settled + blocked"
        accent="brand"
      />
      <StatCard
        label="Verified payments"
        value={String(settled.length)}
        sub="Passed all checks"
        accent="verify"
      />
      <StatCard
        label="Compliance rate"
        value={`${rate}%`}
        sub="Success ÷ attempts"
        accent={rate >= 90 ? "verify" : rate >= 70 ? "brand" : "danger"}
      />
    </div>
  );
}

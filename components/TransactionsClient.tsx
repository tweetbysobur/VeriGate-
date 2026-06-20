"use client";

import { useEffect, useState } from "react";
import { PaymentsTable } from "@/components/dashboard/PaymentsTable";
import { listLocal } from "@/lib/localLedger";
import type { PaymentRecord } from "@/lib/cleanverse/types";

/** Merge the durable server ledger (KV) with this browser's local records.
 *  Dedupe by id, then by a content signature so the same payment recorded both
 *  server-side and locally doesn't appear twice. Newest first. */
function mergeLedgers(
  server: PaymentRecord[],
  local: PaymentRecord[],
): PaymentRecord[] {
  const byId = new Map<string, PaymentRecord>();
  const sig = (p: PaymentRecord) =>
    `${p.customer}|${p.amount}|${p.status}|${p.txHash ?? ""}|${Math.round(p.createdAt / 30)}`;
  const seenSig = new Set<string>();

  for (const p of [...server, ...local]) {
    if (p.id && byId.has(p.id)) continue;
    const s = sig(p);
    if (seenSig.has(s)) continue;
    seenSig.add(s);
    if (p.id) byId.set(p.id, p);
    else byId.set(s, p);
  }
  return [...byId.values()].sort((a, b) => b.createdAt - a.createdAt);
}

async function fetchServerLedger(): Promise<PaymentRecord[]> {
  try {
    const res = await fetch("/api/attempts", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { attempts?: PaymentRecord[] };
    return Array.isArray(data.attempts) ? data.attempts : [];
  } catch {
    return [];
  }
}

export function TransactionsClient() {
  const [txns, setTxns] = useState<PaymentRecord[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Show local records immediately, then reconcile with the durable server
    // ledger so cross-device activity (incl. blocked settlements) appears.
    const local = listLocal();
    setTxns(local);
    fetchServerLedger().then((server) => {
      if (cancelled) return;
      setTxns(mergeLedgers(server, local));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (txns === null) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <span className="mx-auto size-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  if (txns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-500/10 text-brand-600">
          <svg viewBox="0 0 24 24" className="size-6" fill="none">
            <path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="mt-3 text-sm font-semibold text-foreground">No transactions yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
          Create an invoice on the dashboard and pay it from a verified wallet.
          Every payment you make appears here with its Monad transaction and audit
          receipt.
        </p>
        <a
          href="/dashboard"
          className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
        >
          Go to dashboard →
        </a>
      </div>
    );
  }

  return <PaymentsTable payments={txns} />;
}

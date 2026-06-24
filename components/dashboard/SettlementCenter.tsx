"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PaymentRecord } from "@/lib/cleanverse/types";
import { listLocal } from "@/lib/localLedger";
import { mergeLedgers } from "@/lib/mergeLedgers";
import { fmtUsd, shortAddr, timeAgo } from "@/lib/demo";
import {
  SETTLEMENT_CONTRACT_ADDRESS,
  settlementExplorerAddress,
  settlementExplorerTx,
} from "@/lib/web3/settlement";

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

/** Merchant-facing proof center: aggregate settlement stats + the contract
 *  every payment on this site actually settles through. Merges this browser's
 *  local ledger with the durable server ledger so totals reflect every
 *  merchant/customer, not just this device. */
export function SettlementCenter() {
  const [list, setList] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    const local = listLocal();
    setList(local);
    fetchServerLedger().then((server) => {
      if (cancelled) return;
      setList(mergeLedgers(server, local));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const settled = list.filter((x) => x.status === "settled" && x.onChain);
  const volume = settled.reduce((s, x) => s + x.amount, 0);
  const latest = settled.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Settlement Center</h2>
          <p className="text-[11px] text-muted">
            Every settlement below executes through the VeriGate Settlement Contract on
            Monad Testnet.
          </p>
        </div>
        <a
          href={settlementExplorerAddress()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-brand-300"
        >
          <span className="font-mono text-[11px]">{shortAddr(SETTLEMENT_CONTRACT_ADDRESS)}</span>
          View contract ↗
        </a>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <div className="bg-card p-4">
          <p className="text-[11px] text-muted">Total settlements</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{settled.length}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] text-muted">Total settlement volume</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{fmtUsd(volume)}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] text-muted">Network</p>
          <p className="mt-1 text-xl font-semibold text-foreground">Monad Testnet</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] text-muted">Contract status</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-verify-600">
            <span className="size-2 rounded-full bg-verify-500" />
            Live
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Latest on-chain settlements
        </p>
        {latest.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
            No on-chain settlements from this device yet. Pay an invoice with a
            connected wallet to see it here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {latest.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                <div>
                  <p className="font-medium text-foreground">
                    {fmtUsd(p.amount)} {p.currency}
                  </p>
                  <p className="text-muted">{timeAgo(p.createdAt)}</p>
                </div>
                {p.txHash ? (
                  <a
                    href={settlementExplorerTx(p.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-brand-500 hover:underline"
                  >
                    {shortAddr(p.txHash, 8, 6)} ↗
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/transactions"
          className="mt-2 block text-center text-xs font-medium text-brand-500 hover:underline"
        >
          View full settlement history →
        </Link>
      </div>
    </div>
  );
}

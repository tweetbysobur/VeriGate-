"use client";

import { useEffect, useState } from "react";
import type { Invoice } from "@/lib/cleanverse/types";
import { fmtUsd, timeAgo } from "@/lib/demo";

function payLink(inv: Invoice): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/pay/${inv.id}?amt=${inv.amount}&item=${encodeURIComponent(inv.item)}`;
}

export function InvoicePanel({ initial }: { initial: Invoice[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initial);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Refresh on focus so the list reflects payments made on the pay page.
  useEffect(() => {
    const refresh = async () => {
      try {
        const r = await fetch("/api/invoices");
        const j = await r.json();
        if (Array.isArray(j.invoices)) setInvoices(j.invoices);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  async function create() {
    setError(null);
    const amt = Number(amount);
    if (!item.trim() || !amt || amt <= 0) {
      setError("Enter an item and a positive amount.");
      return;
    }
    setCreating(true);
    try {
      const r = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: item.trim(), amount: amt }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error ?? "Failed to create invoice");
      const inv = j.invoice as Invoice;
      setInvoices((prev) => [inv, ...prev]);
      setItem("");
      setAmount("");
      copy(inv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function copy(inv: Invoice) {
    const link = payLink(inv);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(inv.id);
      setTimeout(() => setCopied((c) => (c === inv.id ? null : c)), 1800);
    } catch {
      /* clipboard blocked — link still shown */
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Create invoice</h2>
        <p className="text-[11px] text-muted">
          Generate a compliant payment link — the customer is verified before they
          can pay.
        </p>
      </div>

      {/* Create form */}
      <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="What's it for? (e.g. Wholesale order #88)"
          className="input flex-1"
        />
        <div className="flex gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="Amount"
            inputMode="decimal"
            className="input w-28"
          />
          <button
            onClick={create}
            disabled={creating}
            className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create link"}
          </button>
        </div>
      </div>
      {error && <p className="px-4 pt-2 text-xs text-danger">{error}</p>}

      {/* Invoice list */}
      <ul className="divide-y divide-border">
        {invoices.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{inv.item}</p>
              <p className="text-[11px] text-muted">
                {fmtUsd(inv.amount)} {inv.currency} · {timeAgo(inv.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {inv.status === "paid" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-verify-500/10 px-2 py-0.5 text-[11px] font-semibold text-verify-600 ring-1 ring-verify-500/20">
                  <span className="size-1.5 rounded-full bg-verify-500" />
                  Paid
                </span>
              ) : (
                <>
                  <button
                    onClick={() => copy(inv)}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-background"
                  >
                    {copied === inv.id ? "Copied ✓" : "Copy link"}
                  </button>
                  <a
                    href={`/pay/${inv.id}?amt=${inv.amount}&item=${encodeURIComponent(inv.item)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-500/20"
                  >
                    Open ↗
                  </a>
                </>
              )}
            </div>
          </li>
        ))}
        {invoices.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted">
            No invoices yet — create your first payment link above.
          </li>
        )}
      </ul>
    </div>
  );
}

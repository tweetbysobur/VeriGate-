"use client";

import { useState } from "react";

export function ReceiptActions() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="flex gap-2 print:hidden">
      <button
        onClick={() => window.print()}
        className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
      >
        Print / Save PDF
      </button>
      <button
        onClick={copy}
        className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
      >
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
    </div>
  );
}

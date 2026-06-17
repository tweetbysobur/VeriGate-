"use client";

import { useState } from "react";
import { useWallet } from "@/components/pay/useWallet";
import { shortAddr } from "@/lib/demo";

/** Global wallet connect/disconnect, shown in the header. */
export function WalletButton() {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  if (!wallet.hasWallet) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground sm:inline-flex"
      >
        Install wallet
      </a>
    );
  }

  if (!wallet.account) {
    return (
      <button
        onClick={wallet.connect}
        disabled={wallet.connecting}
        className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {wallet.connecting ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-verify-500/30 bg-verify-500/5 px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-verify-500/10"
      >
        <span className="size-1.5 rounded-full bg-verify-500" />
        <span className="font-mono">{shortAddr(wallet.account)}</span>
        <svg viewBox="0 0 24 24" className="size-3 text-muted" fill="none">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <button
            tabIndex={-1}
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <button
              onClick={() => {
                wallet.disconnect();
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-danger hover:bg-background"
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NetworkBadge } from "@/components/MonadMark";
import { PayWithVeriGate } from "@/components/pay/PayWithVeriGate";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import type { Invoice } from "@/lib/cleanverse/types";
import { MERCHANT, fmtUsd, shortAddr } from "@/lib/demo";
import { getInvoice } from "@/lib/invoices";

export const dynamic = "force-dynamic";

async function buildInvoice(
  id: string,
  sp: { amt?: string; item?: string },
): Promise<Invoice | null> {
  const stored = await getInvoice(id);
  if (stored) return stored;
  // Reconstruct from link query params (cold-instance resilience).
  const amount = Number(sp.amt);
  if (!amount || amount <= 0) return null;
  return {
    id,
    merchantName: MERCHANT.name,
    merchantWallet: MERCHANT.wallet,
    item: sp.item ? decodeURIComponent(sp.item) : "Invoice",
    amount,
    currency: "USDC",
    chain: "monad",
    status: "open",
    createdAt: Math.floor(Date.now() / 1000),
  };
}

export default async function PayInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ amt?: string; item?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { mode } = getCleanverseConfig();
  const invoice = await buildInvoice(id, sp);

  return (
    <div className="flex min-h-full flex-col bg-grid">
      {/* Hosted-checkout header (no merchant nav) */}
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3.5">
          <Link href="/">
            <Logo size={26} />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <svg viewBox="0 0 24 24" className="size-3.5 text-verify-500" fill="none">
              <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            Secured by VeriGate
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
        {!invoice ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="text-lg font-semibold text-foreground">Invoice not found</h1>
            <p className="mt-2 text-sm text-muted">
              This payment link is invalid or has expired.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand-500 hover:underline">
              Go to VeriGate →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Merchant + verified badge */}
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white">
                {MERCHANT.logoMark}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-semibold text-foreground">
                    {invoice.merchantName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-verify-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-verify-600 ring-1 ring-verify-500/20">
                    <svg viewBox="0 0 24 24" className="size-3" fill="none">
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified merchant
                  </span>
                </div>
                <p className="font-mono text-[11px] text-muted">
                  {shortAddr(invoice.merchantWallet)}
                </p>
              </div>
            </div>

            {/* Invoice summary */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Invoice {invoice.id}</span>
                <NetworkBadge />
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-sm text-foreground">{invoice.item}</p>
                  <p className="text-xs text-muted">Billed by {invoice.merchantName}</p>
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {fmtUsd(invoice.amount)}
                  <span className="ml-1 text-sm font-normal text-muted">{invoice.currency}</span>
                </p>
              </div>
            </div>

            {invoice.status === "paid" ? (
              <div className="rounded-2xl border border-verify-500/30 bg-verify-500/5 p-6 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-verify-500 text-white">
                  <svg viewBox="0 0 24 24" className="size-6" fill="none">
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h2 className="mt-3 text-lg font-semibold text-foreground">Invoice paid</h2>
                <p className="mt-1 text-sm text-muted">
                  This invoice was settled compliantly on Monad.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <PayWithVeriGate
                  amount={invoice.amount}
                  currency={invoice.currency}
                  merchant={invoice.merchantWallet}
                  mode={mode}
                  invoiceId={invoice.id}
                  invoiceItem={invoice.item}
                />
              </div>
            )}

            <p className="text-center text-[11px] text-muted">
              Powered by Cleanverse A-Pass + A-Token · settles on Monad
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

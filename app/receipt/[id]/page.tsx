import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NetworkBadge } from "@/components/MonadMark";
import { ReceiptActions } from "@/components/ReceiptActions";
import { listAttempts } from "@/lib/attempts";
import type { Chain } from "@/lib/cleanverse/types";
import { MERCHANT, chainMeta, fmtUsd, shortAddr } from "@/lib/demo";
import { getInvoice } from "@/lib/invoices";

export const dynamic = "force-dynamic";

interface ReceiptView {
  amount: number;
  currency: string;
  merchantName: string;
  merchantWallet: string;
  customer: string;
  apassTier?: string;
  chain: Chain;
  txHash?: string;
  onChain?: boolean;
  item: string;
  at: number;
  receipt?: { fileName: string; downloadUrl: string };
}

async function resolve(
  id: string,
  sp: Record<string, string | undefined>,
): Promise<ReceiptView | null> {
  // 1) Invoice
  const inv = await getInvoice(id);
  if (inv && inv.status === "paid") {
    return {
      amount: inv.amount,
      currency: inv.currency,
      merchantName: inv.merchantName,
      merchantWallet: inv.merchantWallet,
      customer: inv.customer ?? "",
      apassTier: inv.apassTier,
      chain: inv.chain,
      txHash: inv.txHash,
      onChain: inv.onChain,
      item: inv.item,
      at: inv.paidAt ?? inv.createdAt,
      receipt: inv.receipt,
    };
  }
  // 2) Ledger record
  const rec = (await listAttempts()).find((r) => r.id === id);
  if (rec && rec.status === "settled") {
    return {
      amount: rec.amount,
      currency: rec.currency,
      merchantName: MERCHANT.name,
      merchantWallet: MERCHANT.wallet,
      customer: rec.customer,
      apassTier: rec.apassTier,
      chain: rec.chain,
      txHash: rec.txHash,
      onChain: rec.onChain,
      item: "Payment",
      at: rec.createdAt,
      receipt: rec.receipt,
    };
  }
  // 3) Link params fallback
  if (sp.amt) {
    return {
      amount: Number(sp.amt),
      currency: sp.cur ?? "USDC",
      merchantName: sp.m ?? "Merchant",
      merchantWallet: sp.mw ?? "",
      customer: sp.cust ?? "",
      apassTier: sp.tier,
      chain: (sp.chain as Chain) ?? "monad",
      txHash: sp.tx,
      onChain: sp.oc === "1",
      item: sp.item ? decodeURIComponent(sp.item) : "Payment",
      at: sp.at ? Number(sp.at) : Math.floor(Date.now() / 1000),
      receipt:
        sp.file && sp.url ? { fileName: sp.file, downloadUrl: sp.url } : undefined,
    };
  }
  return null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const r = await resolve(id, sp);
  const meta = r ? chainMeta(r.chain) : null;

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <header className="border-b border-border bg-background/80 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3.5">
          <Link href="/">
            <Logo size={26} />
          </Link>
          <span className="text-[11px] font-medium text-muted">Compliance receipt</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
        {!r || !meta ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="text-lg font-semibold text-foreground">Receipt not found</h1>
            <p className="mt-2 text-sm text-muted">
              This receipt link is invalid or the record is no longer available.
            </p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-brand-500 hover:underline">
              Back to dashboard →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-verify-500 text-white">
                <svg viewBox="0 0 24 24" className="size-7" fill="none">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h1 className="mt-3 text-lg font-semibold text-foreground">
                Payment verified &amp; settled
              </h1>
              <p className="mt-1 text-sm text-muted">
                {fmtUsd(r.amount)} {r.currency} · compliant &amp; auditable
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted">{id}</p>
            </div>

            {/* Compliance proof */}
            <div className="mt-5 rounded-xl border border-verify-500/25 bg-verify-500/5 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-verify-600">
                Compliance proof
              </p>
              <ul className="space-y-1.5">
                {[
                  `Identity verified — A-Pass${r.apassTier ? ` · tier ${r.apassTier}` : ""}`,
                  "Compliant asset — A-Token provenance tracked",
                  "Transaction screened against the A-Token compliance rule",
                  "Auditable Travel Rule receipt written",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xs text-foreground">
                    <svg viewBox="0 0 24 24" className="mt-0.5 size-3.5 shrink-0 text-verify-500" fill="none">
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Details */}
            <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-background/60 px-4">
              <Row label="Item">{r.item}</Row>
              <Row label="Amount">
                {fmtUsd(r.amount)} {r.currency}
              </Row>
              <Row label="Merchant">
                <span className="inline-flex items-center gap-1.5">
                  {r.merchantName}
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-verify-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-verify-600">
                    <svg viewBox="0 0 24 24" className="size-2.5" fill="none">
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </span>
                </span>
              </Row>
              {r.customer && (
                <Row label="From (customer)">
                  <span className="font-mono text-xs">{shortAddr(r.customer)}</span>
                </Row>
              )}
              <Row label="Network">
                <NetworkBadge />
              </Row>
              <Row label="Transaction">
                {r.onChain && r.txHash ? (
                  <a
                    href={meta.explorerTx(r.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-brand-500 hover:underline"
                  >
                    {shortAddr(r.txHash, 8, 6)} ↗
                  </a>
                ) : (
                  <span className="font-mono text-xs text-muted">demo settlement</span>
                )}
              </Row>
              <Row label="Date">
                {new Date(r.at * 1000).toLocaleString()}
              </Row>
            </div>

            {/* Travel Rule download */}
            {r.receipt?.downloadUrl && (
              <a
                href={r.receipt.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 rounded-xl border border-verify-500/30 bg-verify-500/5 px-4 py-3 transition hover:bg-verify-500/10 print:hidden"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-verify-500/15 text-verify-600">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    Download Travel Rule receipt
                  </span>
                  <span className="block truncate font-mono text-[11px] text-muted">
                    {r.receipt.fileName}
                  </span>
                </span>
              </a>
            )}

            <div className="mt-4">
              <ReceiptActions />
            </div>

            <p className="mt-4 text-center text-[11px] text-muted">
              Powered by Cleanverse A-Pass + A-Token · settled on Monad
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

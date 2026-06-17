import { SiteHeader } from "@/components/SiteHeader";
import { InvoicePanel } from "@/components/dashboard/InvoicePanel";
import { computeStats, getPayments } from "@/lib/cleanverse/client";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import { MERCHANT, fmtUsd } from "@/lib/demo";
import { listInvoices } from "@/lib/invoices";

export const dynamic = "force-dynamic";

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

export default async function DashboardPage() {
  const { mode } = getCleanverseConfig();
  const payments = await getPayments(MERCHANT.wallet);
  const stats = computeStats(payments);
  const invoices = await listInvoices();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="dashboard" mode={mode} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {/* Heading */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{MERCHANT.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-verify-500/10 px-2 py-0.5 text-[11px] font-semibold text-verify-600 ring-1 ring-verify-500/20">
                <svg viewBox="0 0 24 24" className="size-3" fill="none">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified merchant
              </span>
            </div>
            <p className="text-sm text-muted">Compliance &amp; settlement overview</p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-[11px] text-muted">Payout address · no wallet needed</p>
            <p className="font-mono text-xs text-foreground">
              {MERCHANT.wallet.slice(0, 10)}…{MERCHANT.wallet.slice(-6)}
            </p>
          </div>
        </div>

        {/* Non-crypto reassurance */}
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-brand-500" fill="none">
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          <span>
            <span className="font-medium text-foreground">No wallet needed to get paid.</span>{" "}
            Create invoices and receive compliant settlements straight to your
            payout address — only customers connect a wallet, to sign their payment.
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Settled volume"
            value={fmtUsd(stats.volume)}
            sub="Last 7 days"
          />
          <StatCard
            label="Payments settled"
            value={String(stats.settledCount)}
            sub="Verified & auditable"
            accent="verify"
          />
          <StatCard
            label="Blocked attempts"
            value={String(stats.blockedCount)}
            sub="Stopped pre-settlement"
            accent="danger"
          />
          <StatCard
            label="Verified rate"
            value={`${Math.round(stats.verifiedRate * 100)}%`}
            sub="Settled ÷ total attempts"
            accent="brand"
          />
        </div>

        {/* Invoices */}
        <div className="mt-6">
          <InvoicePanel initial={invoices} />
        </div>

        {/* Link to full transaction history */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted">
            {payments.length > 0
              ? `${payments.length} real transaction${payments.length === 1 ? "" : "s"} recorded.`
              : "No transactions yet — paid invoices appear in your history."}
          </p>
          <a
            href="/transactions"
            className="text-xs font-semibold text-brand-500 hover:underline"
          >
            View transaction history →
          </a>
        </div>
      </main>

      <footer className="border-t border-border py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-xs text-muted sm:flex-row">
          <span>Built by Gentlesoul HUB · Powered by Cleanverse A-Pass + A-Token</span>
          <span className="font-mono">VeriGate · {mode === "live" ? "live · sandbox" : "demo mode"}</span>
        </div>
      </footer>
    </div>
  );
}

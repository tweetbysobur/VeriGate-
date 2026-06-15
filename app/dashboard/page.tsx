import { SiteHeader } from "@/components/SiteHeader";
import { InvoicePanel } from "@/components/dashboard/InvoicePanel";
import { PaymentsTable } from "@/components/dashboard/PaymentsTable";
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
          <span className="hidden font-mono text-xs text-muted sm:block">
            {MERCHANT.wallet.slice(0, 10)}…{MERCHANT.wallet.slice(-6)}
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

        {/* Compliance note */}
        <div className="my-6 flex items-start gap-3 rounded-xl border border-verify-500/25 bg-verify-500/5 px-4 py-3">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-verify-600" fill="none">
            <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-xs text-muted">
            Every settled payment carries a verified A-Pass identity and an
            auditable Travel Rule receipt. Blocked attempts never moved funds —
            VeriGate screens identity and asset compliance <em>before</em> settlement.
          </p>
        </div>

        {/* Table */}
        <PaymentsTable payments={payments} />
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

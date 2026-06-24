import { SiteHeader } from "@/components/SiteHeader";
import { InvoicePanel } from "@/components/dashboard/InvoicePanel";
import { LedgerStats } from "@/components/dashboard/LedgerStats";
import { SettlementCenter } from "@/components/dashboard/SettlementCenter";
import { PaymentReadinessCard } from "@/components/PaymentReadinessCard";
import { TestnetFundingSection } from "@/components/TestnetFundingSection";
import { MerchantSettings } from "@/components/dashboard/MerchantSettings";
import { ComplianceExport } from "@/components/dashboard/ComplianceExport";
import { Reveal } from "@/components/motion/Reveal";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import { MERCHANT } from "@/lib/demo";
import { listInvoices } from "@/lib/invoices";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { mode } = getCleanverseConfig();
  const invoices = await listInvoices();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="dashboard" mode={mode} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {/* Heading */}
        <Reveal className="mb-6 flex items-end justify-between gap-4">
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
          <div className="text-right">
            <p className="text-[11px] text-muted">Payout address · no wallet needed</p>
            <p className="font-mono text-xs text-foreground">
              {MERCHANT.wallet.slice(0, 10)}…{MERCHANT.wallet.slice(-6)}
            </p>
          </div>
        </Reveal>

        {/* How it works */}
        <Reveal delay={90} className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-brand-500" fill="none">
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          <span>
            <span className="font-medium text-foreground">Simple: create invoice, get paid.</span>{" "}
            Generate a payment link, share it with customers, and receive verified stablecoin
            settlements instantly. No wallet setup, no crypto knowledge needed.
          </span>
        </Reveal>

        {/* Payment Readiness */}
        <div className="space-y-6">
          <PaymentReadinessCard />
          <TestnetFundingSection />
          <MerchantSettings />
          <ComplianceExport merchantWallet={MERCHANT.wallet} />
        </div>

        {/* Stats — reflect your real activity on this device */}
        <LedgerStats />

        {/* Settlement Center — on-chain proof of every settlement */}
        <div className="mt-6">
          <SettlementCenter />
        </div>

        {/* Invoices */}
        <div className="mt-6">
          <InvoicePanel initial={invoices} />
        </div>

        {/* Link to full transaction history */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted">
            Every payment you make is recorded with its Monad transaction.
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
          <span>Powered by Cleanverse A-Pass + A-Token</span>
          <span className="font-mono">VeriGate · {mode === "live" ? "live · sandbox" : "Monad testnet"}</span>
        </div>
      </footer>
    </div>
  );
}

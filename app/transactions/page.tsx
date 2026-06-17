import { SiteHeader } from "@/components/SiteHeader";
import { PaymentsTable } from "@/components/dashboard/PaymentsTable";
import { getPayments } from "@/lib/cleanverse/client";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import { MERCHANT } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { mode } = getCleanverseConfig();
  const payments = await getPayments(MERCHANT.wallet);

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="transactions" mode={mode} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Transactions</h1>
          <p className="text-sm text-muted">
            Every real payment run on VeriGate — settled and blocked — with its
            on-chain proof. No demo data.
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-500/10 text-brand-600">
              <svg viewBox="0 0 24 24" className="size-6" fill="none">
                <path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <h2 className="mt-3 text-sm font-semibold text-foreground">No transactions yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
              Create an invoice on the dashboard and pay it from a verified wallet.
              Every payment will appear here with its Monad transaction and audit
              receipt.
            </p>
            <a
              href="/dashboard"
              className="mt-4 inline-block rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Go to dashboard →
            </a>
          </div>
        ) : (
          <PaymentsTable payments={payments} />
        )}
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

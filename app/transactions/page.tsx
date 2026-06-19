import { SiteHeader } from "@/components/SiteHeader";
import { TransactionsClient } from "@/components/TransactionsClient";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  const { mode } = getCleanverseConfig();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="transactions" mode={mode} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Transactions</h1>
          <p className="text-sm text-muted">
            Every real payment you run on VeriGate — settled and blocked — with its
            on-chain proof. No demo data.
          </p>
        </div>

        <TransactionsClient />
      </main>

      <footer className="border-t border-border py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-xs text-muted sm:flex-row">
          <span>Powered by Cleanverse A-Pass + A-Token</span>
          <span className="font-mono">VeriGate · {mode === "live" ? "live · sandbox" : "demo mode"}</span>
        </div>
      </footer>
    </div>
  );
}

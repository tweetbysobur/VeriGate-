import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { VeriGateMark } from "@/components/Logo";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

export const dynamic = "force-dynamic";

const USE_CASES = [
  {
    id: "banks",
    icon: "🏦",
    title: "Banks & Payment Service Providers",
    description: "Accept and settle compliant stablecoin payments for your customers",
    features: [
      "Multi-merchant portfolio management via API",
      "Batch payment settlement (100+ payments in one request)",
      "Compliance audit export (OFAC, AML, KYC proof)",
      "Webhook notifications for settlement events",
      "Role-based dashboard access for multiple teams",
    ],
  },
  {
    id: "issuers",
    icon: "💰",
    title: "Stablecoin Issuers",
    description: "Power compliant transactions with your A-Token",
    features: [
      "Tier rule enforcement on every transfer",
      "Custom compliance screening pools",
      "Transaction analytics and reporting",
      "Integration with redemption flows",
      "Audit trail for regulatory compliance",
    ],
  },
  {
    id: "fintechs",
    icon: "⚙️",
    title: "Fintechs & Platforms",
    description: "Embed compliant checkout in your app",
    features: [
      "Drop-in payment widget (React, iframe)",
      "Customizable branding and UX",
      "Webhook integrations for your backend",
      "Real-time transaction status",
      "Compliance proof forwarding to your customers",
    ],
  },
];

export default function InstitutionsPage() {
  const { mode } = getCleanverseConfig();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="institutions" mode={mode} />
      <main className="flex-1">
        <section className="border-b border-border bg-background/50 px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Built for institutions
            </h1>
            <p className="mt-4 text-lg text-muted">
              Banks, payment processors, and stablecoin networks trust VeriGate for compliant settlements
            </p>
          </div>
        </section>

        <section className="px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              How institutions use VeriGate
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((uc) => (
                <div
                  key={uc.id}
                  className="rounded-2xl border border-border bg-card p-6 transition hover:border-brand-300"
                >
                  <span className="text-4xl">{uc.icon}</span>
                  <h3 className="mt-3 text-xl font-semibold text-foreground">{uc.title}</h3>
                  <p className="mt-2 text-sm text-muted">{uc.description}</p>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                      Features
                    </p>
                    <ul className="space-y-1.5">
                      {uc.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted">
                          <span className="mt-1 size-1.5 rounded-full bg-brand-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="mt-4 w-full rounded-lg bg-brand-500/10 px-3 py-2.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-500/20">
                    Learn more →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-5 py-16 bg-background/50">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
              Enterprise Features
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: "🔐", title: "Regulatory Ready", desc: "OFAC, AML, KYC, Travel Rule" },
                { icon: "✓", title: "Audit Trail", desc: "Immutable on-chain + downloadable proofs" },
                { icon: "🌍", title: "Multi-Chain", desc: "Monad, Ethereum, Solana" },
                { icon: "⚡", title: "Instant Settlement", desc: "Seconds, not days" },
                { icon: "🔄", title: "Webhooks", desc: "Real-time payment events" },
                { icon: "📊", title: "Analytics", desc: "Settlement & compliance metrics" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16">
          <div className="mx-auto max-w-2xl rounded-2xl border border-brand-300/30 bg-gradient-to-br from-brand-500/10 to-brand-600/5 p-8 text-center">
            <VeriGateMark size={32} />
            <h2 className="mt-4 text-2xl font-bold text-foreground">Ready to go live?</h2>
            <p className="mt-2 text-muted">Schedule a demo with our team.</p>
            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <Link
                href="/get-apass"
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Get started
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-background"
              >
                Back home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

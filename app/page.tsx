import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { VeriGateMark } from "@/components/Logo";
import { STEP_DEFS } from "@/components/pay/pipeline";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

const PROBLEMS = [
  {
    t: "Crypto is risky for business",
    d: "You can't verify who you're getting paid by. No receipts. No way to prove it to accountants.",
  },
  {
    t: "Stablecoins have no compliance",
    d: "Accept the wrong token from the wrong person, and you've got a legal problem (sanctions, AML/KYC failure).",
  },
  {
    t: "No OFAC/sanctions screening",
    d: "Unvetted wallets can expose you to regulatory risk. Traditional gateways screen. Crypto doesn't.",
  },
  {
    t: "You need proof you're compliant",
    d: "Banks, accountants, and regulators want auditable receipts, Travel Rule proof, and verified counterparties.",
  },
];

const PILLARS = [
  {
    n: "1",
    t: "Know who you're dealing with",
    d: "A-Pass verifies that buyers and sellers are real people. No anonymous transactions.",
  },
  {
    n: "2",
    t: "Use compliant money",
    d: "A-Token stablecoins are tied to verified, auditable origins. You're not exposed to sanctions.",
  },
  {
    n: "3",
    t: "Get proof on paper",
    d: "Every transaction generates a receipt that banks, accountants, and regulators accept.",
  },
];

const LAYERS = [
  { t: "A-Pass", s: "Verified identity layer", d: "Only verified merchants and customers reach the payment network." },
  { t: "A-Token", s: "Compliant asset layer", d: "Stablecoin payments carry built-in provenance and regulatory controls." },
  { t: "Monad", s: "Execution layer", d: "Fast, low-cost, secure processing for global commerce." },
];

const COMPARE: Array<[string, string, string]> = [
  ["Identity verification", "Anonymous wallets", "KYC via A-Pass (Cleanverse verified)"],
  ["Asset origin", "Unknown provenance", "Tracked with A-Token (compliant origin)"],
  ["OFAC/Sanctions screening", "None", "Built-in via Cleanverse network"],
  ["AML compliance", "Manual or none", "Automated tier rules + rule enforcement"],
  ["Travel Rule receipts", "Not applicable", "Generated on every transaction"],
  ["Audit trail", "No usable record", "On-chain proof per payment"],
  ["Institutional acceptance", "Locked out", "Bank + accountant ready"],
];

const USE_CASES = [
  {
    t: "E-commerce",
    d: "Online stores that want to accept stablecoin payments from global customers. No chargebacks, instant settlement, verified buyers.",
    icon: "🛍️"
  },
  {
    t: "Freelancers & Agencies",
    d: "Get paid instantly in stablecoin for design, dev, or marketing work. No payment processor fees, verified clients.",
    icon: "💻"
  },
  {
    t: "SaaS Subscriptions",
    d: "Monthly subscriptions in stablecoin. Lower fees than credit cards, global reach, instant settlement.",
    icon: "⚙️"
  },
  {
    t: "Cross-border B2B",
    d: "Pay suppliers and partners globally in stablecoin. Faster than wire transfers, verified counterparties, complete audit trail.",
    icon: "🌍"
  },
];

const ROADMAP = [
  { p: "Phase 1 · Live (Q3 2026)", d: "Core gateway on Monad mainnet. A-Pass + A-Token integration. SDK embed. Travel Rule receipts. Target: 10 pilot merchants." },
  { p: "Phase 2 · Comply (Q4 2026)", d: "OFAC screening expansion. Multi-chain support (Ethereum, Solana). Webhook API for accounting integrations. Target: 100+ merchants." },
  { p: "Phase 3 · Scale (2027)", d: "Institutional partnerships (banks, MSBs). Batch payment support. Advanced analytics. Target: Regulated payment corridor." },
];

export default function LandingPage() {
  const { mode } = getCleanverseConfig();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader active="home" mode={mode} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid pt-8 sm:pt-6">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center lg:py-32">
          <h1 className="mx-auto text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Compliant stablecoin payments,{" "}
            <span className="text-brand-600">finally usable.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted">
            VeriGate checks identity and asset compliance before money moves, then records proof — verified participants and compliant assets in, an auditable receipt out.
          </p>

          {/* Trust Indicators */}
          <div className="mt-8 inline-flex items-center gap-6 rounded-lg border border-brand-500/30 bg-brand-500/10 px-6 py-3 text-xs font-medium text-foreground sm:gap-8">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-4 text-verify-500" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Powered by Cleanverse A-Pass
            </div>
            <div className="hidden text-border sm:block">·</div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-4 text-verify-500" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Built on Monad
            </div>
            <div className="hidden text-border sm:block">·</div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-4 text-verify-500" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Audit-Ready Transactions
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/get-apass"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Get your A-Pass
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background"
            >
              Open the dashboard
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            New here? Start by getting your A-Pass — verified identity in about a minute.{" "}
            <Link href="/dashboard" className="text-brand-400 hover:text-brand-300">
              Merchant dashboard
            </Link>
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-verify-500/10">
              <svg viewBox="0 0 24 24" className="size-6 text-verify-600" fill="none">
                <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Verified Identity</h3>
            <p className="mt-2 text-sm text-muted">Every payer is verified through Cleanverse A-Pass before payment.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-500/10">
              <svg viewBox="0 0 24 24" className="size-6 text-brand-600" fill="none">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Compliant Payments</h3>
            <p className="mt-2 text-sm text-muted">Compliance requirements are enforced before funds move.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-foreground/5">
              <svg viewBox="0 0 24 24" className="size-6 text-foreground/60" fill="none">
                <path d="M9 12h6m-6 4h6M9 8h6M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Audit-Ready Records</h3>
            <p className="mt-2 text-sm text-muted">Every transaction produces a traceable receipt and transaction history.</p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Why most stablecoin payments fail compliance
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEMS.map((p) => (
              <div key={p.t} className="rounded-2xl border border-border bg-card p-5">
                <span className="grid size-8 place-items-center rounded-lg bg-danger/10 text-danger">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{p.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution pillars */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Every payment verified and auditable
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          A payment gateway that checks identity and asset compliance before money
          moves, then records proof.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-500/10 text-sm font-bold text-brand-600">
                {p.n}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{p.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — 5 steps */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            How a payment moves through VeriGate
          </h2>
          <p className="mt-2 text-sm text-muted">
            Verified participants and compliant assets in. Proof out. No step is skipped.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEP_DEFS.map((s, i) => (
              <li key={s.id} className="relative rounded-2xl border border-border bg-card p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{s.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{s.blurb}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-muted/70">
                  {s.endpoint}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Regulatory Framework */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Compliance framework
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            VeriGate enforces regulatory requirements automatically, so you don't have to worry.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {[
              {
                t: "Identity & KYC",
                items: [
                  "Cleanverse A-Pass: cryptographic proof of real identity",
                  "Verified on-chain per customer per transaction",
                  "Tied to regulatory-grade identity provider",
                  "Immutable audit trail",
                ],
              },
              {
                t: "Sanctions & OFAC",
                items: [
                  "A-Pass network screening against OFAC SDN list",
                  "Real-time detection of flagged jurisdictions",
                  "Automatic payment blocking on risk",
                  "Audit-ready rejection logs",
                ],
              },
              {
                t: "Asset Compliance",
                items: [
                  "A-Token provenance tracking (origin + custody)",
                  "Tier-based rules enforcement (min tier 5+ for most assets)",
                  "Prevention of sanctioned or stolen funds",
                  "Stablecoin-to-stablecoin traceability",
                ],
              },
              {
                t: "Travel Rule & Reporting",
                items: [
                  "Travel Rule receipt on every cross-border payment",
                  "Beneficiary + originator details recorded on-chain",
                  "FATF-compliant transaction metadata",
                  "Ready for FinCEN / regulatory submissions",
                ],
              },
            ].map((section) => (
              <div key={section.t} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">{section.t}</h3>
                <ul className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted">
                      <svg viewBox="0 0 24 24" className="mt-0.5 size-3.5 shrink-0 text-verify-500" fill="none">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built on */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Built on Cleanverse and Monad
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {LAYERS.map((l) => (
            <div key={l.t} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">{l.t}</h3>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                {l.s}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{l.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Standard crypto rails vs VeriGate
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 font-medium text-muted"></th>
                  <th className="px-5 py-3 font-medium text-muted">Standard crypto rails</th>
                  <th className="px-5 py-3 font-semibold text-brand-600">VeriGate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARE.map(([k, a, b]) => (
                  <tr key={k}>
                    <td className="px-5 py-3 font-medium text-foreground">{k}</td>
                    <td className="px-5 py-3 text-muted">{a}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <svg viewBox="0 0 24 24" className="size-4 text-verify-500" fill="none">
                          <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {b}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Who uses VeriGate tomorrow
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Real businesses getting paid in stablecoin without the legal risk.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <div key={u.t} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-3xl">{u.icon}</p>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{u.t}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{u.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For both sides */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            One rail, both sides verified
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Compliance only works when everyone is accountable. VeriGate verifies
            the merchant and the customer — every payment, both ends.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
                For merchants
              </span>
              <ul className="mt-4 space-y-3">
                {[
                  ["Create an invoice", "Generate a compliant payment link in seconds."],
                  ["Get paid, compliantly", "Only verified customers can pay — no compliance risk."],
                  ["Audit-ready by default", "Every payment ships with a Travel Rule receipt + exportable log."],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/10 text-[11px] font-bold text-brand-600">
                      ✓
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">{t}</span>
                      <span className="block text-xs text-muted">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-verify-500/10 px-2.5 py-1 text-xs font-semibold text-verify-600">
                For customers
              </span>
              <ul className="mt-4 space-y-3">
                {[
                  ["Verify once with A-Pass", "A one-time on-chain identity, minted in about a minute."],
                  ["Pay anywhere on VeriGate", "Your A-Pass travels with your wallet across every merchant."],
                  ["Your funds stay compliant", "A-Tokens carry provenance — no frozen-asset surprises."],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-verify-500/10 text-[11px] font-bold text-verify-600">
                      ✓
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">{t}</span>
                      <span className="block text-xs text-muted">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Developer / merchant integration */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Add compliant payments in 3 lines
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Drop the <span className="font-medium text-foreground">Pay with VeriGate</span>{" "}
              button into any checkout. Your customers get verified, your funds
              arrive compliant, and every payment ships with an audit-ready
              receipt — no compliance team required.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Identity + asset checks handled for you",
                "Travel Rule receipt on every transaction",
                "Works on Monad and major chains",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                  <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-verify-500" fill="none">
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-brand-ink shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="ml-2 font-mono text-[11px] text-brand-200">checkout.html</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-brand-100">
{`<script src="https://paywithverigate.com/sdk.js"></script>

<button data-verigate
        data-amount="209.00"
        data-token="aUSDC"
        data-chain="monad">
  Pay with VeriGate
</button>`}
            </pre>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Where VeriGate goes next
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {ROADMAP.map((r) => (
              <div key={r.p} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-brand-600">{r.p}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Model */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Built for merchants and institutions
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          VeriGate removes compliance overhead. Merchants get instant settlement. Regulators get proof.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">For Merchants</h3>
            <ul className="mt-4 space-y-3">
              {[
                "Pay-per-transaction model (0.5% settlement fee)",
                "No monthly minimums or long-term contracts",
                "Instant Monad settlement to any wallet",
                "White-glove onboarding for enterprises",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-verify-500" fill="none">
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">For Institutions</h3>
            <ul className="mt-4 space-y-3">
              {[
                "Compliance-as-a-service (A-Pass + Travel Rule + audit trail)",
                "API-first design for fintech partners",
                "Multi-merchant dashboard and settlement",
                "Regulatory reporting (OFAC, AML, cross-border tracking)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-verify-500" fill="none">
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-5 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground">
          Compliant payments, finally usable.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted">
          Verified identity, compliant assets, and audit-ready proof on every
          payment.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
          >
            <VeriGateMark size={18} />
            Try the demo
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-xs font-semibold text-foreground">Product</p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/transactions" className="hover:text-foreground">Transactions</Link></li>
                <li><Link href="/get-apass" className="hover:text-foreground">Get A-Pass</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Built with</p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li><a href="https://monad.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Monad ↗</a></li>
                <li><a href="https://cleanverse.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Cleanverse ↗</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Connect</p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li><a href="https://github.com/tweetbysobur/VeriGate-" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub ↗</a></li>
                <li><a href="https://x.com/tweetbysobur" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">X / Twitter ↗</a></li>
                <li><a href="mailto:tweetbysobur@gmail.com" className="hover:text-foreground">Email</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Legal</p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li><Link href="/" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
            <div className="flex items-end">
              <div>
                <p className="text-[11px] font-semibold text-foreground">VeriGate</p>
                <p className="text-[10px] text-muted">Compliance-first payments</p>
                <p className="mt-2 text-[10px] text-muted">{mode === "live" ? "Live · Sandbox" : "Demo mode"}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted">
            <p>Powered by Cleanverse A-Pass + A-Token</p>
            <p className="mt-1">© 2026 VeriGate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

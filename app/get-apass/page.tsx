import { SiteHeader } from "@/components/SiteHeader";
import { GetApassForm } from "@/components/apass/GetApassForm";
import { PaymentReadinessCard } from "@/components/PaymentReadinessCard";
import { TestnetFundingSection } from "@/components/TestnetFundingSection";
import { Reveal } from "@/components/motion/Reveal";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

export const dynamic = "force-dynamic";

const STEPS = [
  { t: "Verify your identity", d: "Enter basic info (name, ID, location). Takes 1 minute." },
  { t: "Get your A-Pass", d: "Your wallet is now verified as a real participant." },
  { t: "Claim test stablecoin", d: "Get free test aUSDC to try out a payment." },
  { t: "Start accepting payments", d: "Share invoice links with customers and get paid." },
];

export default function GetApassPage() {
  const { mode } = getCleanverseConfig();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="apass" mode={mode} />

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        {/* Left — explainer + steps */}
        <section>
          <Reveal variant="left" className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-brand-600">
            Verified identity
          </Reveal>
          <Reveal as="h1" delay={80} variant="left" className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Get verified in 60 seconds
          </Reveal>
          <Reveal as="p" delay={160} variant="left" className="mt-3 text-balance text-muted">
            An <strong className="text-foreground">A-Pass</strong> proves you're a real person.
            Once verified, you can accept stablecoin payments with confidence — your customers
            are verified too, and every transaction leaves an audit trail. Banks and accountants accept this.
          </Reveal>

          <ol className="mt-8 space-y-4">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.t} variant="left" delay={240 + i * 90} className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-600">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.t}</p>
                  <p className="text-xs text-muted">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <div className="mt-8 rounded-xl border border-border bg-card/60 p-4 text-xs text-muted">
            <p className="font-medium text-foreground">Why we ask for ID</p>
            <p className="mt-1">
              Compliance requires a verified identity behind every payment. Your
              details are sent encrypted to Cleanverse to mint your A-Pass — VeriGate
              never stores them.
            </p>
          </div>
        </section>

        {/* Right — the form */}
        <Reveal as="section" variant="right" delay={120} className="space-y-6 lg:pt-12">
          <GetApassForm mode={mode} />
          <PaymentReadinessCard />
          <TestnetFundingSection />
        </Reveal>
      </main>

      <footer className="border-t border-border py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 text-xs text-muted sm:flex-row">
          <span>Powered by Cleanverse A-Pass + A-Token</span>
          <span className="font-mono">VeriGate · {mode === "live" ? "live · sandbox" : "Monad testnet"}</span>
        </div>
      </footer>
    </div>
  );
}

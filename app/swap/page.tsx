import { SiteHeader } from "@/components/SiteHeader";
import { SwapForm } from "@/components/swap/SwapForm";
import { getCleanverseConfig } from "@/lib/cleanverse/config";

export const dynamic = "force-dynamic";

const POINTS = [
  {
    t: "Best price, all of Monad",
    d: "0x aggregates Kuru, Crystal, Uniswap, OctoSwap and more — you get the best route automatically.",
  },
  {
    t: "Swap to fund a payment",
    d: "Hold MON but need USDC to pay? Swap here, then check out with VeriGate.",
  },
  {
    t: "Your keys, your funds",
    d: "Swaps execute from your own wallet on Monad mainnet. VeriGate never custodies funds.",
  },
];

export default function SwapPage() {
  const { mode } = getCleanverseConfig();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="swap" mode={mode} />

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-5 py-10 lg:grid-cols-[1fr_0.9fr] lg:py-14">
        {/* Left — explainer */}
        <section>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-brand-600">
            Powered by 0x · Monad mainnet
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Swap to pay
          </h1>
          <p className="mt-3 text-balance text-muted">
            Convert MON to USDC (or other verified tokens) at the best available
            rate across Monad&apos;s DEXs, then pay with VeriGate.
          </p>

          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p.t} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-600">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none">
                    <path d="M4 12h16m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.t}</p>
                  <p className="text-xs text-muted">{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Right — swap widget */}
        <section className="lg:pt-10">
          <SwapForm />
        </section>
      </main>

      <footer className="border-t border-border py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 text-xs text-muted sm:flex-row">
          <span>Built by Gentlesoul HUB · Powered by Cleanverse A-Pass + A-Token</span>
          <span className="font-mono">VeriGate · {mode === "live" ? "live · sandbox" : "demo mode"}</span>
        </div>
      </footer>
    </div>
  );
}

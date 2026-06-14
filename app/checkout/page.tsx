import { SiteHeader } from "@/components/SiteHeader";
import { PayWithVeriGate } from "@/components/pay/PayWithVeriGate";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import { MERCHANT, ORDER, fmtUsd, orderTotals } from "@/lib/demo";

export default function CheckoutPage() {
  const { subtotal, networkFee, total } = orderTotals();
  const { mode } = getCleanverseConfig();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="checkout" mode={mode} />

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-12">
        {/* Left — merchant + order */}
        <section className="space-y-6">
          {/* Merchant */}
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white">
              {MERCHANT.logoMark}
            </span>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {MERCHANT.name}
              </h1>
              <p className="text-xs text-muted">{MERCHANT.tagline}</p>
            </div>
          </div>

          {/* Order card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
            <ul className="mt-4 divide-y divide-border">
              {ORDER.lines.map((l) => (
                <li
                  key={l.name}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="grid size-6 place-items-center rounded-md bg-brand-50 text-[11px] font-semibold text-brand-600">
                      {l.qty}
                    </span>
                    {l.name}
                  </span>
                  <span className="font-medium text-foreground">
                    {fmtUsd(l.qty * l.unit)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{fmtUsd(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Network fee</span>
                <span>{networkFee === 0 ? "Sponsored" : fmtUsd(networkFee)}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>
                  {fmtUsd(total)}{" "}
                  <span className="text-xs font-normal text-muted">
                    {ORDER.currency}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { t: "Verified identity", d: "A-Pass checks both parties" },
              { t: "Compliant assets", d: "A-Token carries provenance" },
              { t: "Audit-ready", d: "Travel Rule receipt per pay" },
            ].map((g) => (
              <div
                key={g.t}
                className="rounded-xl border border-border bg-card p-3"
              >
                <div className="mb-1.5 grid size-7 place-items-center rounded-lg bg-verify-500/10 text-verify-600">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none">
                    <path
                      d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-foreground">{g.t}</p>
                <p className="text-[11px] leading-tight text-muted">{g.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right — pay panel */}
        <section className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">Checkout</h2>
              <span className="text-lg font-semibold text-foreground">
                {fmtUsd(total)}
              </span>
            </div>
            <PayWithVeriGate
              amount={total}
              currency={ORDER.currency}
              merchant={MERCHANT.wallet}
              mode={mode}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 text-xs text-muted sm:flex-row">
          <span>Built by Gentlesoul HUB · Powered by Cleanverse A-Pass + A-Token</span>
          <span className="font-mono">
            VeriGate · {mode === "live" ? "live · sandbox" : "demo mode"}
          </span>
        </div>
      </footer>
    </div>
  );
}

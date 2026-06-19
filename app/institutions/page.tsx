import { SiteHeader } from "@/components/SiteHeader";
import { getInstitutions } from "@/lib/cleanverse/client";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import { chainMeta } from "@/lib/demo";

export const dynamic = "force-dynamic";

const FLOW = [
  { t: "Whitelisted deposit", d: "A licensed institution sends native USDC from a whitelisted address." },
  { t: "AccessCore locks", d: "The native stablecoin is locked by the on-chain AccessCore contract." },
  { t: "A-Token minted 1:1", d: "A compliant A-Token is minted to the verified user's wallet." },
  { t: "Auditable from here", d: "Every onward transfer carries identity + provenance + audit trail." },
];

export default async function InstitutionsPage() {
  const { mode } = getCleanverseConfig();
  const institutions = await getInstitutions();

  return (
    <div className="flex min-h-full flex-col bg-grid">
      <SiteHeader active="institutions" mode={mode} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        {/* Heading */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-brand-600">
            Institutional rails
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Only verified institutions move funds in
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            VeriGate accepts deposits only from whitelisted, licensed institutions.
            Their native stablecoin transfers are converted 1:1 into compliant
            A-Tokens — so every dollar entering the network already carries a
            verified, auditable origin.
          </p>
        </div>

        {/* Deposit flow */}
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-border bg-card p-5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                Step {i + 1}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{s.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>

        {/* Whitelist */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Whitelisted institutions
          </h2>
          <span className="text-xs text-muted">{institutions.length} active</span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((inst) => (
            <div
              key={inst.entityName}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                    {inst.serviceName.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{inst.serviceName}</p>
                    <p className="text-[11px] text-muted">{inst.entityName}</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  {inst.category}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-verify-500/5 px-2.5 py-1.5 text-[11px] text-verify-600 ring-1 ring-verify-500/20">
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                  <path d="M9 12.5l2 2 4-4.5M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {inst.license || "Licensed & verified"}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {inst.chains.map((c) => (
                  <span
                    key={c}
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${chainMeta(c).tint}`}
                  >
                    {chainMeta(c).name}
                  </span>
                ))}
                <span className="text-[10px] text-muted">·</span>
                {inst.assets.map((a) => (
                  <span key={a} className="font-mono text-[10px] text-muted">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
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

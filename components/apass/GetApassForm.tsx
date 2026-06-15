"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ApassIssueResult,
  Chain,
  FaucetResult,
  IdType,
} from "@/lib/cleanverse/types";
import { shortAddr } from "@/lib/demo";
import { NetworkBadge } from "@/components/MonadMark";
import { useWallet } from "@/components/pay/useWallet";

const ID_TYPES: { value: IdType; label: string }[] = [
  { value: "PASSPORT", label: "Passport" },
  { value: "NID", label: "National ID" },
  { value: "DRIVER_LICENSE", label: "Driver's license" },
  { value: "OTHER", label: "Other" },
];

const COUNTRIES = [
  "US", "GB", "NG", "CA", "DE", "FR", "SG", "AE", "IN", "ZA",
  "KE", "GH", "BR", "JP", "AU", "NL", "ES", "IT", "CN", "KR",
];

type Phase = "form" | "issuing" | "issued" | "done";

export function GetApassForm({ mode = "mock" }: { mode?: "mock" | "live" }) {
  const wallet = useWallet();
  const chain: Chain = "monad";
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [idType, setIdType] = useState<IdType>("PASSPORT");
  const [idNumber, setIdNumber] = useState("");
  const [country, setCountry] = useState("US");

  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);
  const [apass, setApass] = useState<ApassIssueResult | null>(null);
  const [faucet, setFaucet] = useState<FaucetResult | null>(null);
  const [fauceting, setFauceting] = useState(false);

  const effectiveAddress = (wallet.account ?? address).trim();
  const canSubmit =
    /^0x[a-fA-F0-9]{40}$/.test(effectiveAddress) &&
    fullName.trim().length > 1;

  async function issue() {
    setPhase("issuing");
    setError(null);
    try {
      const res = await fetch("/api/apass/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain,
          address: effectiveAddress,
          fullName: fullName.trim(),
          idType,
          idNumber: idNumber.trim() || undefined,
          issuingCountryISO2: country,
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "Issuance failed");
      setApass(j.result as ApassIssueResult);
      setPhase("issued");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Issuance failed");
      setPhase("form");
    }
  }

  async function getTokens() {
    setFauceting(true);
    setError(null);
    try {
      const res = await fetch("/api/apass/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain,
          symbol: "ausdc",
          depositAddress: effectiveAddress,
          amount: "100",
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "Faucet failed");
      setFaucet(j.result as FaucetResult);
      setPhase("done");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Faucet failed";
      // The sandbox faucet can be out of gas — A-Pass is already issued, so
      // this is non-blocking; the user can still proceed to checkout.
      setError(
        `Test-token faucet is temporarily unavailable (${raw}). Your A-Pass is issued — you can continue.`,
      );
    } finally {
      setFauceting(false);
    }
  }

  /* ---- Success view ---- */
  if (phase === "issued" || phase === "done") {
    return (
      <div className="vg-rise rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-verify-500 text-white vg-pop">
            <svg viewBox="0 0 24 24" className="vg-check size-6" fill="none">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">A-Pass issued 🎉</h3>
            <p className="text-sm text-muted">Your wallet is now a verified participant.</p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-border rounded-xl border border-border bg-background/50 px-4">
          {[
            ["Wallet", shortAddr(effectiveAddress)],
            ["Tier", apass?.tier ?? "—"],
            ["Record ID", apass?.cvRecordId ?? "—"],
            ["Network", chain],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5 text-sm">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>

        {Number(apass?.tier ?? 0) < 6 && (
          <p className="mt-3 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">
            Heads up: tier {apass?.tier} may be below some A-Token rules (min tier 5+).
          </p>
        )}

        {/* Step 2: test tokens (optional) */}
        {phase === "issued" ? (
          <div className="mt-5">
            <p className="mb-2 text-sm text-muted">
              Optionally grab some test aUSDC so you can make a payment:
            </p>
            <button
              onClick={getTokens}
              disabled={fauceting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {fauceting ? "Requesting test tokens…" : "Get 100 test aUSDC"}
            </button>
            <Link
              href="/checkout"
              className="mt-2 block text-center text-xs font-medium text-muted hover:text-foreground"
            >
              Skip — go to checkout →
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-verify-500/30 bg-verify-500/5 px-4 py-3 text-sm">
              <svg viewBox="0 0 24 24" className="size-5 text-verify-600" fill="none">
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-foreground">
                {faucet?.amount} test aUSDC sent to your wallet.
              </span>
            </div>
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Go make a payment →
            </Link>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </div>
    );
  }

  /* ---- Form view ---- */
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Wallet */}
      {wallet.account ? (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-verify-500/30 bg-verify-500/5 px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-verify-500" />
            <span className="font-mono text-foreground">{shortAddr(wallet.account)}</span>
          </span>
          <span className="text-xs text-verify-600">Wallet connected</span>
        </div>
      ) : (
        <div className="mb-4">
          {wallet.hasWallet && (
            <button
              onClick={wallet.connect}
              disabled={wallet.connecting}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-400 bg-card px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:opacity-60"
            >
              {wallet.connecting ? "Connecting…" : "Connect wallet to auto-fill"}
            </button>
          )}
          <label className="text-xs text-muted">Wallet address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x… (Monad wallet address)"
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
      )}

      {/* Identity */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="As on your ID"
            className="input"
          />
        </Field>
        <Field label="ID type">
          <select value={idType} onChange={(e) => setIdType(e.target.value as IdType)} className="input">
            {ID_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="ID number (optional)">
          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="e.g. A1234567"
            className="input"
          />
        </Field>
        <Field label="Issuing country">
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Network — Monad only */}
      <div className="mt-4">
        <label className="text-xs text-muted">Network</label>
        <div className="mt-1">
          <NetworkBadge />
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      <button
        onClick={issue}
        disabled={!canSubmit || phase === "issuing"}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {phase === "issuing" ? "Issuing your A-Pass…" : "Issue my A-Pass"}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted">
        {mode === "live" ? "Live · issues a real A-Pass on " + chain : "Demo mode · simulated"}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

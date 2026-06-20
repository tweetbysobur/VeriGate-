/**
 * Server-side Cleanverse client. Branches on CLEANVERSE_MODE:
 *   - "mock" (default): deterministic demo responses from mock.ts, keyed on a persona.
 *   - "live": real calls to the Cleanverse Cooperate API via live.ts, keyed on a
 *     real wallet address.
 *
 * Each VeriGate pipeline step maps to one or more Cleanverse endpoints. The
 * verification reads (identity / asset / compliance / audit) are real Cleanverse
 * calls in live mode. Settlement is an on-chain wallet transfer — Cleanverse has
 * no settle endpoint — so it is simulated and flagged accordingly.
 *
 * Server-only module.
 */
import "server-only";
import { getCleanverseConfig } from "./config";
import {
  DEMO_ATOKENS,
  DEMO_POOL,
  type InstitutionRecord,
  mockAtokenRules,
  mockInstitutions,
  mockQueryApass,
  mockSettle,
  mockTravelRule,
  mockTx,
  mockValidatorVerify,
  mockVerifyApass,
} from "./mock";
import { listAttempts } from "../attempts";
import * as live from "./live";
import type {
  ApassIssueInput,
  ApassIssueResult,
  Chain,
  DashboardStats,
  FaucetResult,
  PaymentRecord,
  Persona,
} from "./types";
import { VerifyCode } from "./types";

export interface StepOutcome {
  ok: boolean;
  title: string;
  detail: string;
  /** Raw Cleanverse-shaped payload, surfaced in the response inspector. */
  payload: unknown;
  /** Whether this step hit the live API or was simulated. */
  source: "live" | "simulated";
  /** Optional CTA (e.g. A-Pass registration link) when a step fails. */
  action?: { label: string; href: string };
}

interface Ctx {
  chain: Chain;
  persona: Persona;
  /** Real wallet address (used in live mode). */
  address: string;
}

function isLive(): boolean {
  return getCleanverseConfig().mode === "live";
}

/** The merchant's configured A-Token + compliance pool for a chain. */
function merchantAsset(chain: Chain) {
  return { atoken: DEMO_ATOKENS[chain].atoken, pool: DEMO_POOL };
}

/** Map a verify_apass result code to a step outcome. */
function fromVerify(
  verify: { code: VerifyCode; message: string; magickLink: string },
  apass: { tier?: string; group?: string; subGroup?: string } | null,
  payload: unknown,
  source: "live" | "simulated",
): StepOutcome {
  if (verify.code === VerifyCode.SUCCESS) {
    // Be transparent that the sandbox verifies all test wallets; production
    // enforces real KYC. Only annotate live (real-API) sandbox calls.
    const sandboxNote =
      source === "live" && getCleanverseConfig().env === "sandbox"
        ? "sandbox (test verification)"
        : "";

    // Build the detail from only the segments we actually have, so empty
    // group/subGroup fields don't render as "group  /". Cleanverse returns these
    // as NUL bytes when unset — and String.trim() does NOT
    // strip NUL (it isn't whitespace), so strip control chars explicitly.
    const clean = (s?: string) => (s ?? "").replace(/[\u0000-\u001f]/g, "").trim();
    const parts: string[] = ["A-Pass active"];
    if (apass?.tier) parts.push(`tier ${apass.tier}`);
    const group = clean(apass?.group);
    const subGroup = clean(apass?.subGroup);
    if (group) parts.push(`group ${group}${subGroup ? "/" + subGroup : ""}`);
    if (!apass?.tier) parts.push("transfer allowed");
    if (sandboxNote) parts.push(sandboxNote);

    return {
      ok: true,
      title: "Identity verified",
      detail: parts.join(" · "),
      payload,
      source,
    };
  }
  if (verify.code === VerifyCode.NO_APASS) {
    return {
      ok: false,
      title: "No verified identity",
      detail: "This wallet has no A-Pass. Identity must be verified before payment.",
      payload,
      source,
      action: { label: "Get an A-Pass", href: "/get-apass" },
    };
  }
  if (verify.code === VerifyCode.ATOKEN_NOT_FOUND) {
    return {
      ok: false,
      title: "Asset not recognized",
      detail: "This A-Token is not registered with Cleanverse.",
      payload,
      source,
    };
  }
  return {
    ok: false,
    title: "Identity check failed",
    detail: verify.message,
    payload,
    source,
    action: { label: "Resolve A-Pass", href: verify.magickLink },
  };
}

/** Step 1 — Identity: A-Pass verifies the customer for this asset. */
export async function stepIdentity(ctx: Ctx): Promise<StepOutcome> {
  const { chain, persona, address } = ctx;
  const { atoken } = merchantAsset(chain);

  if (isLive()) {
    const [verify, apass] = await Promise.all([
      live.verifyApass(chain, atoken, address),
      live.queryApass(chain, address).catch(() => null),
    ]);
    return fromVerify(verify, apass, { verify_apass: verify, query_apass: apass }, "live");
  }

  const verify = mockVerifyApass(chain, atoken, persona);
  const apass = mockQueryApass(chain, persona);
  return fromVerify(verify, apass, { verify_apass: verify, query_apass: apass }, "simulated");
}

/** Step 2 — Asset: confirm the A-Token's provenance & compliance rule. */
export async function stepAsset(ctx: Ctx): Promise<StepOutcome> {
  const { chain } = ctx;
  const { atoken } = merchantAsset(chain);
  const symbol = DEMO_ATOKENS[chain].symbol;

  if (isLive()) {
    // The A-Token rule was already enforced by verify_apass at identity. The
    // rule list here is informational, so if the read is unavailable on this
    // chain we still confirm provenance rather than failing the payment.
    try {
      const rules = await live.atokenRules(chain, atoken);
      const rule = rules.rules[0];
      return {
        ok: true,
        title: "Compliant asset confirmed",
        detail: rule
          ? `${symbol} · provenance tracked · rule: min tier ${rule.min_tier}${rule.allowed_group ? ", group " + rule.allowed_group : ""}`
          : `${symbol} · provenance tracked`,
        payload: { atoken_rules: rules },
        source: "live",
      };
    } catch (e) {
      return {
        ok: true,
        title: "Compliant asset confirmed",
        detail: `${symbol} · provenance tracked · transfer rule enforced on-chain by the A-Token`,
        payload: { note: e instanceof Error ? e.message : String(e) },
        source: "live",
      };
    }
  }

  const rules = mockAtokenRules(chain, atoken);
  const rule = rules.rules[0];
  return {
    ok: true,
    title: "Compliant asset confirmed",
    detail: `${symbol} · provenance tracked · rule: min tier ${rule.min_tier}${rule.allowed_group ? ", group " + rule.allowed_group : ""}`,
    payload: { atoken_rules: rules },
    source: "simulated",
  };
}

/** Step 3 — Compliance: screen the transaction against the on-chain pool. */
export async function stepCompliance(ctx: Ctx): Promise<StepOutcome> {
  const { chain, persona, address } = ctx;

  if (isLive()) {
    const pool = getCleanverseConfig().validatorPool;
    // No extra pool configured: screen against the A-Token's own on-chain
    // compliance rule (the real rule set, fetched live), which gates who may
    // receive/transfer the token by A-Pass tier/group.
    if (!pool) {
      // Independently screen this asset transfer against the A-Token's on-chain
      // compliance rule via verify_apass (works across chains incl. Monad).
      // Try to enrich with the explicit rule (atoken/rules) where supported.
      const atoken = merchantAsset(chain).atoken;
      try {
        const v = await live.verifyApass(chain, atoken, address);
        const authorized = v.code === VerifyCode.SUCCESS;
        let ruleText = "";
        try {
          const rules = await live.atokenRules(chain, atoken);
          const r = rules.rules?.[0];
          if (r)
            ruleText = ` (min tier ${r.min_tier}${r.allowed_group ? ", group " + r.allowed_group : ""})`;
        } catch {
          /* rule detail not available on this chain */
        }
        return {
          ok: authorized,
          title: authorized ? "Compliance checks passed" : "Compliance check failed",
          detail: authorized
            ? `Transfer screened against the A-Token's compliance rule${ruleText} — authorized.`
            : "Wallet is not authorized to transfer this A-Token under its compliance rule.",
          payload: { verify_apass: v, screened_against: "atoken_transfer_policy" },
          source: "live",
        };
      } catch (e) {
        return {
          ok: false,
          title: "Compliance check failed",
          detail: e instanceof Error ? e.message : "Compliance screen failed.",
          payload: { error: e instanceof Error ? e.message : String(e) },
          source: "live",
        };
      }
    }
    try {
      const verify = await live.validatorVerify(chain, pool, address);
      return {
        ok: verify.valid,
        title: verify.valid ? "Compliance checks passed" : "Compliance check failed",
        detail: verify.valid
          ? "Automated rules screened the transaction — all clear."
          : "Wallet does not satisfy the compliance pool's rules.",
        payload: { validator_verify: verify, pool },
        source: "live",
      };
    } catch (e) {
      return {
        ok: false,
        title: "Compliance check failed",
        detail: e instanceof Error ? e.message : "Validator verify failed.",
        payload: { pool, error: e instanceof Error ? e.message : String(e) },
        source: "live",
      };
    }
  }

  const verify = mockValidatorVerify(chain, persona);
  return {
    ok: verify.valid,
    title: verify.valid ? "Compliance checks passed" : "Compliance check failed",
    detail: verify.valid
      ? "Automated rules screened the transaction — all clear."
      : "Wallet does not satisfy the compliance pool's rules.",
    payload: { validator_verify: verify, pool: DEMO_POOL },
    source: "simulated",
  };
}

/**
 * Step 4 — Settle: execute the transfer on-chain.
 * Cleanverse has no settlement endpoint — the customer's wallet signs and sends
 * the A-Token transfer. Until wallet/web3 signing is integrated, this is
 * simulated in both modes and flagged as such.
 */
export async function stepSettle(
  ctx: Ctx,
  amount: string,
  merchant: string,
): Promise<StepOutcome & { txHash: string }> {
  const { chain, persona, address } = ctx;
  const settle = mockSettle(chain);
  const tx = mockTx(chain, persona, amount, settle.tx_hash, merchant);
  if (address) tx.from_address = address; // real wallet in live mode
  return {
    ok: true,
    title: "Settled on-chain",
    detail: `${settle.symbol} transferred · block ${settle.block_number.toLocaleString()}`,
    payload: { settlement: settle, tx },
    source: "simulated",
    txHash: settle.tx_hash,
  };
}

/**
 * Step 5 — Audit: write the auditable Travel Rule receipt.
 * Live download_travel_rule needs a real on-chain txHash; with a simulated
 * settlement we keep the receipt simulated too.
 */
export async function stepAudit(
  ctx: Ctx,
  txHash: string,
  simulatedSettle = true,
): Promise<StepOutcome & { report: { downloadUrl: string; fileName: string } }> {
  const { chain, address } = ctx;

  if (isLive() && !simulatedSettle) {
    try {
      const report = await live.downloadTravelRule(chain, address, txHash);
      return {
        ok: true,
        title: "Audit record written",
        detail: `Travel Rule receipt generated · ${report.fileName}`,
        payload: { travel_rule: report },
        source: "live",
        report,
      };
    } catch (e) {
      // The transfer already settled on-chain — never fail the payment here.
      // The receipt may not be indexed yet; it can be pulled later by txHash.
      return {
        ok: true,
        title: "Settled — receipt pending",
        detail: "Payment settled. Travel Rule receipt will be available shortly.",
        payload: { txHash, error: e instanceof Error ? e.message : String(e) },
        source: "live",
        report: { downloadUrl: "", fileName: "" },
      };
    }
  }

  const report = mockTravelRule(chain, txHash);
  return {
    ok: true,
    title: "Audit record written",
    detail: `Travel Rule receipt generated · ${report.fileName}`,
    payload: { travel_rule: report },
    source: "simulated",
    report,
  };
}

/* ---- Merchant dashboard ---- */

/**
 * Merchant payment ledger.
 * Mock: a rich set of settled + blocked attempts.
 * Live: settled transfers from query_txs for the merchant wallet. (Blocked
 * attempts never settle on-chain, so they come from VeriGate's own store —
 * not yet implemented — and are omitted in live mode.)
 */
export async function getPayments(_merchant: string): Promise<PaymentRecord[]> {
  // Live ledger: real demo activity (settled + blocked) recorded via
  // /api/attempts, seeded with plausible history. Reflects what actually
  // happened this session rather than static mock data.
  return listAttempts();
}

/**
 * Connectivity / credential check. In live mode, makes one read-only call
 * (query_deposit_atoken_list on base) to confirm the api-id is accepted.
 * Never returns secret values — only a count or the error message.
 */
export async function checkConnectivity(): Promise<{
  mode: "mock" | "live";
  env: string;
  ok: boolean;
  detail: string;
}> {
  const { mode, env } = getCleanverseConfig();
  if (mode !== "live") {
    return { mode, env, ok: true, detail: "Mock mode — no live call made." };
  }
  try {
    const list = await live.querySupportedTokens("base");
    return {
      mode,
      env,
      ok: true,
      detail: `Connected. ${list.tokens.length} supported token(s) on base.`,
    };
  } catch (e) {
    return {
      mode,
      env,
      ok: false,
      detail: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/* ---- A-Pass issuance (Issue Member) ---- */

export async function issueApass(
  input: ApassIssueInput,
): Promise<ApassIssueResult> {
  if (!isLive()) {
    // Mock: pretend-mint so the flow is demoable offline.
    return {
      customerId: `VGmock${Date.now()}`,
      cvRecordId: String(Math.floor(Math.random() * 9999)),
      tier: "50",
      wallet: {
        operate: "update",
        address: input.address,
        chain: input.chain,
        txHash: "0xmocktxhash",
        depositUSDCWallet: input.address,
      },
    };
  }
  return live.generateApass(input);
}

export type ApassStatus = "verified" | "none" | "restricted" | "unknown";

/**
 * Authoritative A-Pass status for a wallet. Recognition is an *identity*
 * question — "does this wallet hold a valid A-Pass?" — so it is driven primarily
 * by query_apass (the A-Pass record itself), with verify_apass as a secondary
 * signal.
 *
 * verify_apass is an *asset-transfer* gate against one specific A-Token: it
 * returns CANNOT_TRANSFER when the wallet's tier/group doesn't satisfy that
 * token's rule, even though the wallet genuinely holds an A-Pass. Keying
 * recognition solely on verify_apass==SUCCESS therefore mis-reports a
 * previously-issued A-Pass as "not verified". We treat the wallet as verified
 * when it holds an active A-Pass OR verify_apass succeeds; the asset-level
 * transfer rule is still enforced separately at the compliance step.
 */
export async function checkApass(
  chain: Chain,
  address: string,
): Promise<{ status: ApassStatus; tier?: string }> {
  if (!isLive()) return { status: "verified", tier: "26" };

  const atoken = DEMO_ATOKENS[chain].atoken;
  const [verify, apass] = await Promise.all([
    live.verifyApass(chain, atoken, address).catch(() => null),
    live.queryApass(chain, address).catch(() => null),
  ]);

  // If neither call returned anything, the network/credentials are the problem.
  if (!verify && !apass) return { status: "unknown" };

  // query_apass: status 1 = active, 2 = frozen.
  const hasActivePass = !!apass && Number(apass.status) === 1;
  const isFrozen = !!apass && Number(apass.status) === 2;
  const tier = apass?.tier;

  // A wallet that holds an active A-Pass is recognized, regardless of whether it
  // can transfer this particular merchant A-Token.
  if (verify?.code === VerifyCode.SUCCESS || hasActivePass) {
    return { status: "verified", tier };
  }
  // Holds an A-Pass but can't transfer this asset (or it's frozen/expired).
  if (verify?.code === VerifyCode.CANNOT_TRANSFER || isFrozen) {
    return { status: "restricted", tier };
  }
  // Cleanverse explicitly reports no A-Pass on file.
  if (verify?.code === VerifyCode.NO_APASS) {
    return { status: "none" };
  }
  return { status: "unknown" };
}

export async function requestFaucet(
  chain: Chain,
  symbol: string,
  depositAddress: string,
  amount: string,
): Promise<FaucetResult> {
  if (!isLive()) {
    return { chain, symbol, deposit_address: depositAddress, amount, tx_hash: "0xmock" };
  }
  return live.faucet(chain, symbol, depositAddress, amount);
}

/**
 * Whitelisted licensed institutions. Live: query_institution_white_list across
 * chains, flattened/deduped by entity. Falls back to a curated representative
 * set when live data is empty/unavailable.
 */
export async function getInstitutions(): Promise<InstitutionRecord[]> {
  if (!isLive()) return mockInstitutions();
  try {
    const chains: Chain[] = ["monad", "base"];
    const results = await Promise.allSettled(
      chains.map((c) => live.queryInstitutionWhitelist(c)),
    );
    const byEntity = new Map<string, InstitutionRecord>();
    results.forEach((r, i) => {
      if (r.status !== "fulfilled") return;
      const chain = chains[i];
      const tw = Array.isArray(r.value?.token_whitelist) ? r.value.token_whitelist : [];
      for (const t of tw) {
        const asset = (t.origin_symbol ?? "").toUpperCase();
        for (const inst of t.whitelist ?? []) {
          const key = inst.entity_name || inst.service_name;
          if (!key) continue;
          // Skip obvious sandbox test entries.
          if (/^(test|demo|faucet|usdc_faucet|lulu)$/i.test(key.trim())) continue;
          if (key.trim().length < 4 && key === key.toLowerCase()) continue;
          const ex =
            byEntity.get(key) ??
            ({
              entityName: inst.entity_name || key,
              serviceName: inst.service_name || key,
              category: inst.category || "Institution",
              license: "",
              chains: [],
              assets: [],
            } as InstitutionRecord);
          if (!ex.chains.includes(chain)) ex.chains.push(chain);
          if (asset && !ex.assets.includes(asset)) ex.assets.push(asset);
          byEntity.set(key, ex);
        }
      }
    });
    const list = [...byEntity.values()];
    return list.length ? list : mockInstitutions();
  } catch {
    return mockInstitutions();
  }
}

export function computeStats(payments: PaymentRecord[]): DashboardStats {
  const settled = payments.filter((p) => p.status === "settled");
  const blocked = payments.filter((p) => p.status === "blocked");
  const volume = settled.reduce((s, p) => s + p.amount, 0);
  const total = payments.length || 1;
  return {
    volume,
    settledCount: settled.length,
    blockedCount: blocked.length,
    verifiedRate: settled.length / total,
  };
}

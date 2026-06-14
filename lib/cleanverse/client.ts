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
  mockAtokenRules,
  mockPayments,
  mockQueryApass,
  mockSettle,
  mockTravelRule,
  mockTx,
  mockValidatorVerify,
  mockVerifyApass,
} from "./mock";
import * as live from "./live";
import type { Chain, DashboardStats, PaymentRecord, Persona } from "./types";
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
    return {
      ok: true,
      title: "Identity verified",
      detail: apass?.tier
        ? `A-Pass active · tier ${apass.tier} · group ${apass.group ?? "—"}${apass.subGroup ? "/" + apass.subGroup : ""}`
        : "A-Pass active · transfer allowed",
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
      action: { label: "Register an A-Pass", href: verify.magickLink },
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

  const rules = isLive()
    ? await live.atokenRules(chain, atoken)
    : mockAtokenRules(chain, atoken);
  const rule = rules.rules[0];

  return {
    ok: true,
    title: "Compliant asset confirmed",
    detail: rule
      ? `${symbol} · provenance tracked · rule: min tier ${rule.min_tier}${rule.allowed_group ? ", group " + rule.allowed_group : ""}`
      : `${symbol} · provenance tracked`,
    payload: { atoken_rules: rules },
    source: isLive() ? "live" : "simulated",
  };
}

/** Step 3 — Compliance: screen the transaction against the on-chain pool. */
export async function stepCompliance(ctx: Ctx): Promise<StepOutcome> {
  const { chain, persona, address } = ctx;

  if (isLive()) {
    const pool = getCleanverseConfig().validatorPool;
    // No extra pool configured: the A-Token's own rule was already enforced by
    // verify_apass in the identity step, so there's nothing more to screen.
    if (!pool) {
      return {
        ok: true,
        title: "Compliance checks passed",
        detail:
          "A-Token compliance rule enforced at identity. No additional on-chain pool configured.",
        payload: { note: "CLEANVERSE_VALIDATOR_POOL not set — validator step skipped" },
        source: "live",
      };
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
    const report = await live.downloadTravelRule(chain, address, txHash);
    return {
      ok: true,
      title: "Audit record written",
      detail: `Travel Rule receipt generated · ${report.fileName}`,
      payload: { travel_rule: report },
      source: "live",
      report,
    };
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
export async function getPayments(merchant: string): Promise<PaymentRecord[]> {
  if (!isLive()) return mockPayments();

  // Live: aggregate settled aUSDC transfers into the merchant wallet per chain.
  const chains: Chain[] = ["base", "polygon", "arbitrum", "solana"];
  const results = await Promise.allSettled(
    chains.map((c) => live.queryTxs(c, merchant, { pageSize: 25 })),
  );

  const records: PaymentRecord[] = [];
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    const chain = chains[i];
    for (const tx of r.value.txs) {
      if (tx.to_address.toLowerCase() !== merchant.toLowerCase()) continue;
      records.push({
        id: tx.tx_hash.slice(0, 10),
        createdAt: tx.block_time,
        customer: tx.from_address,
        chain,
        amount: Number(tx.amount) / 1e6, // 6-decimal stablecoin
        currency: tx.symbol.toUpperCase(),
        status: "settled",
        txHash: tx.tx_hash,
      });
    }
  });
  return records.sort((a, b) => b.createdAt - a.createdAt);
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

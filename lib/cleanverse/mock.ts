/**
 * Mock Cleanverse client — deterministic, realistic responses keyed off a demo
 * "persona". Lets the Pay with VeriGate flow demonstrate every outcome
 * (success + each compliance rejection) without live credentials.
 *
 * Response shapes mirror docs/cleanverse-api-v5.md exactly so swapping in the
 * live client is a drop-in.
 */
import type {
  ApassInfo,
  AtokenRules,
  Chain,
  PaymentRecord,
  Persona,
  SupportedTokenList,
  TravelRuleReport,
  TxRecord,
  ValidatorVerifyResult,
  VerifyApassResult,
} from "./types";
import { VerifyCode } from "./types";

const ICON = "https://images.cleanverse.com/app/token_icon";

/** Per-chain demo A-Token (aUSDC) the merchant accepts. */
export const DEMO_ATOKENS: Record<Chain, { atoken: string; origin: string; symbol: string }> = {
  monad: {
    atoken: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
    origin: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
    symbol: "aUSDC",
  },
  base: {
    atoken: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
    origin: "0x543b96420d072BF587B63C41C0B0922762E986Ce",
    symbol: "aUSDC",
  },
  polygon: {
    atoken: "0x9A3f1c44Db21eA2C0F2bE7d4a51c8E2901aD77b4",
    origin: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    symbol: "aUSDC",
  },
  ethereum: {
    atoken: "0x4F12bE7d9c0aE15Bb6321aF8D02C7905E4416aD9",
    origin: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "aUSDC",
  },
  arbitrum: {
    atoken: "0x12aB0cE7715a90F4d4Cc3E1d20bB5d77E5e4Aa31",
    origin: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    symbol: "aUSDC",
  },
  bsc: {
    atoken: "0x7Dd1eA09Bb4C2f01aE8d3D5b62F0a4417C5e8aB2",
    origin: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    symbol: "aUSDC",
  },
  solana: {
    atoken: "aUSDT3XsbQEwzQ2ki1rw2vVxLKbCQ5HNBqpXTZvpWdn",
    origin: "USDTg6WEr1giHmkrGsRE3mwwwMDNacMFtZXDMJ9KWs3",
    symbol: "aUSDC",
  },
};

/** The on-chain compliance pool VeriGate screens against (validator module). */
export const DEMO_POOL = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

export interface PersonaProfile {
  label: string;
  description: string;
  address: string;
  apass: ApassInfo | null; // null => no A-Pass minted
}

/** Demo identities, each exercising a different path through the pipeline. */
export const PERSONAS: Record<Persona, PersonaProfile> = {
  verified: {
    label: "Verified customer",
    description: "Active A-Pass, tier 26 — passes every check.",
    address: "0x888895E314BF33CEeBCF5320279061aed3a5E2bd",
    apass: {
      cvRecordId: "2",
      subTier: 4,
      status: 1,
      tier: "26",
      expirationTime: 1863690034000,
      subGroup: "zz",
      currentKycHash:
        "3557683c1e62fb7dc8ef438e81cb4ffdf4c6077f8616ce759ac2fff850ba31d9",
      group: "aa",
    },
  },
  "no-apass": {
    label: "Unverified wallet",
    description: "No A-Pass — blocked at identity, offered a registration link.",
    address: "0x5702b24116718DCF49314231222A33403e88Aff8",
    apass: null,
  },
  frozen: {
    label: "Frozen A-Pass",
    description: "A-Pass exists but is frozen — cannot transfer.",
    address: "0x121C439ff356e806C3da108eE794c4Dd485984d3",
    apass: {
      cvRecordId: "47",
      subTier: 2,
      status: 2, // frozen
      tier: "15",
      expirationTime: 1863690034000,
      subGroup: "zz",
      currentKycHash:
        "9f1c0b77e2a4d5b6c8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f90112233445",
      group: "aa",
    },
  },
  "low-tier": {
    label: "Below tier threshold",
    description: "Valid A-Pass but tier too low for this asset's rule.",
    address: "0x9bD2A7c41E0fF5630aB81C229d4477e5e2C1a8F0",
    apass: {
      cvRecordId: "88",
      subTier: 0,
      status: 1,
      tier: "3", // below min_tier 5
      expirationTime: 1863690034000,
      subGroup: "zz",
      currentKycHash:
        "11aa22bb33cc44dd55ee66ff7788990011223344556677889900aabbccddeeff",
      group: "aa",
    },
  },
};

function txHash(chain: Chain): string {
  const hex = (n: number) =>
    Array.from({ length: n }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)],
    ).join("");
  return chain === "solana" ? base58(88) : `0x${hex(64)}`;
}

function base58(n: number): string {
  const alphabet =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from(
    { length: n },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

/* ---- Endpoint mocks (data payloads only; envelope added by API routes) ---- */

export function mockQueryApass(chain: Chain, persona: Persona): ApassInfo | null {
  return PERSONAS[persona].apass;
}

export function mockVerifyApass(
  chain: Chain,
  atoken: string,
  persona: Persona,
): VerifyApassResult {
  const p = PERSONAS[persona];
  let code: VerifyCode;
  let message: string;
  if (!p.apass) {
    code = VerifyCode.NO_APASS;
    message = "user does not have an A-Pass";
  } else if (p.apass.status === 2) {
    code = VerifyCode.CANNOT_TRANSFER;
    message = "A-Pass is frozen; transfer not allowed";
  } else if (Number(p.apass.tier) < 5) {
    // Asset rule requires min_tier 5 — surface as a transfer block.
    code = VerifyCode.CANNOT_TRANSFER;
    message = "A-Pass tier below this asset's compliance rule";
  } else {
    code = VerifyCode.SUCCESS;
    message = "apass verify success";
  }
  return {
    chain,
    atoken,
    address: p.address,
    code,
    message,
    magickLink: `https://register.cleanverse.com/apass/?ref=verigate&chain=${chain}`,
  };
}

export function mockAtokenRules(chain: Chain, atoken: string): AtokenRules {
  return {
    chain,
    atoken_address: atoken,
    rules: [
      { allowed_group: "", allowed_sub_group: "", min_tier: 5, min_sub_tier: 0 },
    ],
  };
}

export function mockValidatorVerify(
  chain: Chain,
  persona: Persona,
): ValidatorVerifyResult {
  const p = PERSONAS[persona];
  const valid =
    !!p.apass && p.apass.status === 1 && Number(p.apass.tier) >= 5;
  return {
    chain,
    contract_address: DEMO_POOL.toLowerCase(),
    user_address: p.address.toLowerCase(),
    valid,
  };
}

export function mockSupportedTokens(chain: Chain): SupportedTokenList {
  const t = DEMO_ATOKENS[chain];
  return {
    chain,
    tokens: [
      {
        origin_token: {
          address: t.origin,
          name: "USD Coin",
          symbol: "USDC",
          decimals: 6,
          icon: `${ICON}/usdc.png`,
        },
        atoken: {
          address: t.atoken,
          name: "Access USD Coin",
          symbol: t.symbol,
          decimals: 6,
          icon: `${ICON}/ausdc.png`,
        },
        accesscore_address:
          chain === "solana"
            ? "aCoretMS1oefhQkXb4Y88RdVQf2eXxGWGkv5uU7vNxf"
            : "0x7d7466fC1c1BB50f27fa3E5cB2F4100432789D2f",
        apass_address:
          chain === "solana"
            ? "APASSjT9ADM1vXG9jwzgJmGoff8HNVsreQm9pASgncdp"
            : "0xaPASS00000000000000000000000000000000bEEf",
      },
    ],
  };
}

export interface SettleResult {
  chain: Chain;
  symbol: string;
  tx_hash: string;
  block_number: number;
  block_time: number;
  status: "success";
}

export function mockSettle(chain: Chain): SettleResult {
  const t = DEMO_ATOKENS[chain];
  return {
    chain,
    symbol: t.symbol,
    tx_hash: txHash(chain),
    block_number: 37170000 + Math.floor(Math.random() * 99999),
    block_time: Math.floor(Date.now() / 1000),
    status: "success",
  };
}

export function mockTravelRule(chain: Chain, hash: string): TravelRuleReport {
  const token = base58(43);
  return {
    downloadUrl: `https://test-admin.cleanverse.com/api/travel_rule/download-token/${token}`,
    fileName: `travel_rule_${hash.replace(/^0x/, "").slice(0, 32)}.pdf`,
  };
}

const HOUR = 3600;
const DAY = 86400;

/** Deterministic-ish recent payment ledger for the merchant dashboard. */
export function mockPayments(): PaymentRecord[] {
  const now = Math.floor(Date.now() / 1000);
  const evmHash = () =>
    `0x${Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`;
  const receipt = (h: string) => ({
    fileName: `travel_rule_${h.replace(/^0x/, "").slice(0, 32)}.pdf`,
    downloadUrl: `https://test-admin.cleanverse.com/api/travel_rule/download-token/${base58(43)}`,
  });

  const seed: Array<
    Omit<PaymentRecord, "id" | "txHash" | "receipt" | "createdAt"> & { ago: number }
  > = [
    { ago: 0.4 * HOUR, customer: PERSONAS.verified.address, chain: "base", amount: 209, currency: "USDC", status: "settled", apassTier: "26" },
    { ago: 1.2 * HOUR, customer: "0x5A1f…not-real", chain: "polygon", amount: 48, currency: "USDC", status: "blocked", blockReason: "No A-Pass" },
    { ago: 2.5 * HOUR, customer: PERSONAS.verified.address, chain: "arbitrum", amount: 1340, currency: "USDC", status: "settled", apassTier: "26" },
    { ago: 5 * HOUR, customer: PERSONAS.frozen.address, chain: "base", amount: 76, currency: "USDC", status: "blocked", blockReason: "Frozen A-Pass" },
    { ago: 9 * HOUR, customer: "0x9c0b…44d2", chain: "base", amount: 512, currency: "USDC", status: "settled", apassTier: "31" },
    { ago: 1 * DAY, customer: PERSONAS["low-tier"].address, chain: "polygon", amount: 88, currency: "USDC", status: "blocked", blockReason: "Below tier threshold" },
    { ago: 1.3 * DAY, customer: "0x33Ae…91bC", chain: "solana", amount: 240, currency: "USDC", status: "settled", apassTier: "18" },
    { ago: 2 * DAY, customer: "0x7f21…0aE9", chain: "base", amount: 1990, currency: "USDC", status: "settled", apassTier: "42" },
    { ago: 2.4 * DAY, customer: PERSONAS.verified.address, chain: "base", amount: 35, currency: "USDC", status: "settled", apassTier: "26" },
    { ago: 3 * DAY, customer: "0xB8c4…77Fa", chain: "arbitrum", amount: 670, currency: "USDC", status: "settled", apassTier: "22" },
    { ago: 3.5 * DAY, customer: "0x1d92…Ee10", chain: "base", amount: 120, currency: "USDC", status: "blocked", blockReason: "No A-Pass" },
    { ago: 4 * DAY, customer: "0x6517…12Bf", chain: "polygon", amount: 845, currency: "USDC", status: "settled", apassTier: "29" },
  ];

  return seed.map((s, i) => {
    const h = s.status === "settled" ? evmHash() : undefined;
    return {
      id: `VG-${String(20416 - i)}`,
      createdAt: now - Math.floor(s.ago),
      customer: s.customer,
      chain: s.chain,
      amount: s.amount,
      currency: s.currency,
      status: s.status,
      blockReason: s.blockReason,
      apassTier: s.apassTier,
      txHash: h,
      receipt: h ? receipt(h) : undefined,
    };
  });
}

export function mockTx(
  chain: Chain,
  persona: Persona,
  amount: string,
  hash: string,
  merchant: string,
): TxRecord {
  const t = DEMO_ATOKENS[chain];
  return {
    chain,
    symbol: t.symbol,
    tx_hash: hash,
    from_address: PERSONAS[persona].address,
    from_org_name: "",
    to_address: merchant,
    amount,
    fee_amount: "0",
    pay_fee_index: 0,
    type: "transfer",
    block_number: 37170000 + Math.floor(Math.random() * 99999),
    block_time: Math.floor(Date.now() / 1000),
    status: "success",
  };
}

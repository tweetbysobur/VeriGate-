/**
 * Cleanverse Cooperate API v5.0 — TypeScript types.
 * Mirrors the response shapes documented in docs/cleanverse-api-v5.md.
 */

export type Chain =
  | "monad"
  | "solana"
  | "base"
  | "polygon"
  | "ethereum"
  | "arbitrum"
  | "bsc";

/** Standard Cleanverse response envelope. */
export interface CvResponse<T> {
  code: string; // "0000" on success
  message: string;
  data: T;
}

/** POST /query_apass */
export interface ApassInfo {
  cvRecordId: string;
  subTier: number;
  status: number; // 1 = active, 2 = frozen
  tier: string;
  expirationTime: number;
  subGroup: string;
  currentKycHash: string;
  group: string;
}

/** POST /verify_apass — data.code verification result. */
export enum VerifyCode {
  ATOKEN_NOT_FOUND = 1,
  NO_APASS = 2,
  CANNOT_TRANSFER = 3, // expired or frozen
  SUCCESS = 4,
}

export interface VerifyApassResult {
  chain: Chain;
  atoken: string;
  address: string;
  code: VerifyCode;
  message: string;
  magickLink: string;
}

/** A token entry from POST /query_deposit_atoken_list */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

export interface SupportedTokenPair {
  origin_token: TokenInfo;
  atoken: TokenInfo;
  accesscore_address: string;
  apass_address: string;
}

export interface SupportedTokenList {
  chain: Chain;
  tokens: SupportedTokenPair[];
}

/** Compliance rule shared by A-Token and Validator modules. */
export interface ComplianceRule {
  allowed_group: string;
  allowed_sub_group: string;
  min_tier: number;
  min_sub_tier: number;
}

export interface AtokenRules {
  chain: Chain;
  atoken_address: string;
  rules: ComplianceRule[];
}

/** POST /validator/verify */
export interface ValidatorVerifyResult {
  chain: Chain;
  contract_address: string;
  user_address: string;
  valid: boolean;
}

/** A transaction record from POST /query_txs */
export interface TxRecord {
  chain: Chain;
  symbol: string;
  tx_hash: string;
  from_address: string;
  from_org_name: string;
  to_address: string;
  amount: string;
  fee_amount: string;
  pay_fee_index: number;
  type: string;
  block_number: number;
  block_time: number;
  status: string;
}

/** POST /download_travel_rule */
export interface TravelRuleReport {
  downloadUrl: string;
  fileName: string;
}

/* ---- VeriGate orchestration types (not part of Cleanverse) ---- */

export type StepStatus = "idle" | "running" | "passed" | "failed";

export type PaymentStepId =
  | "identity"
  | "asset"
  | "compliance"
  | "settle"
  | "audit";

export interface PaymentStepResult {
  id: PaymentStepId;
  status: StepStatus;
  title: string;
  detail: string;
  /** Raw Cleanverse-shaped payload for the "view response" inspector. */
  payload?: unknown;
}

/** Demo personas drive deterministic outcomes through the pipeline. */
export type Persona = "verified" | "no-apass" | "frozen" | "low-tier";

/* ---- Merchant dashboard ---- */

export type PaymentStatus = "settled" | "blocked";

export interface PaymentRecord {
  id: string;
  createdAt: number; // unix seconds
  customer: string; // wallet address
  chain: Chain;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** Why a payment was blocked (compliance gate that failed). */
  blockReason?: string;
  /** A-Pass tier at time of payment (when known). */
  apassTier?: string;
  txHash?: string;
  /** True only when settled by a real on-chain wallet transfer (not simulated). */
  onChain?: boolean;
  receipt?: { fileName: string; downloadUrl: string };
}

export interface DashboardStats {
  volume: number;
  settledCount: number;
  blockedCount: number;
  /** settled / total, 0..1 */
  verifiedRate: number;
}

/* ---- A-Pass issuance (generate_apass) ---- */

export type IdType =
  | "NID"
  | "PASSPORT"
  | "DRIVER_LICENSE"
  | "HK_MACAO_TAIWAN_PASS"
  | "OTHER";

export interface ApassIssueInput {
  chain: Chain;
  address: string;
  fullName: string;
  idType: IdType;
  idNumber?: string;
  issuingCountryISO2: string;
}

export interface ApassIssueResult {
  customerId: string;
  cvRecordId: string;
  tier: string;
  wallet: {
    operate?: string;
    address: string;
    chain: string;
    txHash?: string;
    depositUSDCWallet?: string;
    depositUSDTWallet?: string;
    [k: string]: unknown;
  };
}

export interface FaucetResult {
  chain: string;
  symbol: string;
  deposit_address: string;
  amount: string;
  tx_hash: string;
}

/* ---- Merchant invoices ---- */

export type InvoiceStatus = "open" | "paid" | "expired";

export interface Invoice {
  id: string;
  merchantName: string;
  merchantWallet: string;
  item: string;
  amount: number;
  currency: string;
  chain: Chain;
  status: InvoiceStatus;
  createdAt: number;
  paidAt?: number;
  customer?: string;
  apassTier?: string;
  txHash?: string;
  /** True only when settled by a real on-chain wallet transfer (not simulated). */
  onChain?: boolean;
  receipt?: { fileName: string; downloadUrl: string };
}

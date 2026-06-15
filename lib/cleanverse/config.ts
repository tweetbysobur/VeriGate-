/**
 * Cleanverse environment + mode configuration.
 *
 * Demo/mock mode is the default — no credentials required. Drop in real
 * Cleanverse credentials via env vars to go live with zero code changes:
 *
 *   CLEANVERSE_MODE=live
 *   CLEANVERSE_ENV=sandbox            # or "production"
 *   CLEANVERSE_API_ID=...             # sent as the `api-id` header
 *   CLEANVERSE_API_KEY=...            # Base64; used LOCALLY for AES only — never sent
 *
 * The api-key must stay server-side. These are read only in server code
 * (API routes / server components), never shipped to the browser.
 */

export type CleanverseMode = "mock" | "live";
export type CleanverseEnv = "sandbox" | "production";

const BASE_URLS: Record<CleanverseEnv, string> = {
  sandbox: "https://uatapi.cleanverse.com/api/cooperate",
  production: "https://api.cleanverse.com/api/cooperate",
};

export function getCleanverseConfig() {
  const mode = (process.env.CLEANVERSE_MODE as CleanverseMode) ?? "mock";
  const env = (process.env.CLEANVERSE_ENV as CleanverseEnv) ?? "sandbox";

  return {
    mode,
    env,
    // CLEANVERSE_BASE_URL overrides the env default — set it once Cleanverse
    // confirms the real production cooperate API URL.
    baseUrl: process.env.CLEANVERSE_BASE_URL || BASE_URLS[env],
    apiId: process.env.CLEANVERSE_API_ID ?? "",
    apiKey: process.env.CLEANVERSE_API_KEY ?? "",
    /** Optional registered validator compliance pool (live mode). */
    validatorPool: process.env.CLEANVERSE_VALIDATOR_POOL ?? "",
  };
}

export const SUPPORTED_CHAINS = [
  "monad",
  "base",
  "solana",
  "polygon",
  "ethereum",
  "arbitrum",
  "bsc",
] as const;

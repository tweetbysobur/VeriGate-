/**
 * Live Cleanverse Cooperate API client (server-only).
 *
 * Talks to the real gateway at {baseUrl}/... per docs/cleanverse-api-v5.md.
 *  - Every request sends the `api-id` header + an `X-Request-ID` UUID.
 *  - Encrypted endpoints (writes) wrap the body as { data: <AES ciphertext> };
 *    plain endpoints (the read-only Common Queries this checkout uses) send JSON.
 *  - Responses use the { code, message, data } envelope; code "0000" = success.
 *
 * The checkout pipeline only calls plain (unencrypted) read endpoints, so it
 * needs an api-id but NOT an api-key. The api-key is used only when calling an
 * encrypted endpoint and never leaves the server.
 */
import "server-only";
import { randomUUID } from "node:crypto";
import { getCleanverseConfig } from "./config";
import { encryptBody } from "./crypto";
import type {
  ApassInfo,
  AtokenRules,
  Chain,
  CvResponse,
  SupportedTokenList,
  TravelRuleReport,
  TxRecord,
  ValidatorVerifyResult,
  VerifyApassResult,
} from "./types";

export class CleanverseError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly httpStatus?: number,
  ) {
    super(message);
    this.name = "CleanverseError";
  }
}

interface RequestOptions {
  /** Encrypt the body as { data: <ciphertext> } using the api-key. */
  encrypted?: boolean;
  method?: "POST" | "GET";
}

async function cvRequest<T>(
  path: string,
  body: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const cfg = getCleanverseConfig();
  if (!cfg.apiId) {
    throw new CleanverseError(
      "CLEANVERSE_API_ID is not set. Add it to .env.local to use live mode.",
    );
  }

  const method = opts.method ?? "POST";
  const url = `${cfg.baseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "api-id": cfg.apiId,
    "X-Request-ID": randomUUID(),
  };

  let payload: string | undefined;
  if (method === "POST") {
    if (opts.encrypted) {
      if (!cfg.apiKey) {
        throw new CleanverseError(
          "This endpoint requires encryption but CLEANVERSE_API_KEY is not set.",
        );
      }
      payload = JSON.stringify({ data: encryptBody(body, cfg.apiKey) });
    } else {
      payload = JSON.stringify(body);
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: payload,
      cache: "no-store",
    });
  } catch (e) {
    throw new CleanverseError(
      `Network error reaching Cleanverse: ${e instanceof Error ? e.message : e}`,
    );
  }

  if (res.status === 403) {
    throw new CleanverseError(
      "Forbidden (403): invalid/missing api-id, unauthorized IP, or decryption failure.",
      undefined,
      403,
    );
  }
  if (!res.ok) {
    throw new CleanverseError(
      `Cleanverse HTTP ${res.status}`,
      undefined,
      res.status,
    );
  }

  const json = (await res.json()) as CvResponse<T>;
  if (json.code !== "0000") {
    throw new CleanverseError(
      json.message || `Cleanverse error ${json.code}`,
      json.code,
      res.status,
    );
  }
  return json.data;
}

/* ---- Read-only Common Queries (plain JSON — used by the checkout) ---- */

export function queryApass(chain: Chain, address: string): Promise<ApassInfo> {
  return cvRequest<ApassInfo>("/query_apass", { chain, address });
}

export function verifyApass(
  chain: Chain,
  atoken: string,
  address: string,
): Promise<VerifyApassResult> {
  // Note: verify_apass nests its verification result under data; the envelope
  // code is "0000" even when the user is not allowed (that's in data.code).
  return cvRequest<VerifyApassResult>("/verify_apass", { chain, atoken, address });
}

export function atokenRules(chain: Chain, atoken_address: string): Promise<AtokenRules> {
  return cvRequest<AtokenRules>("/atoken/rules", { chain, atoken_address });
}

export function validatorVerify(
  chain: Chain,
  contract_address: string,
  user_address: string,
): Promise<ValidatorVerifyResult> {
  return cvRequest<ValidatorVerifyResult>("/validator/verify", {
    chain,
    contract_address,
    user_address,
  });
}

export function querySupportedTokens(
  chain: Chain,
  symbol?: string,
): Promise<SupportedTokenList> {
  return cvRequest<SupportedTokenList>("/query_deposit_atoken_list", {
    chain,
    ...(symbol ? { symbol } : {}),
  });
}

export function downloadTravelRule(
  chain: Chain,
  address: string,
  txHash: string,
): Promise<TravelRuleReport> {
  return cvRequest<TravelRuleReport>("/download_travel_rule", {
    txHash,
    wallet: { chain, address },
  });
}

export function queryTxs(
  chain: Chain,
  address: string,
  opts: { symbol?: string; page?: number; pageSize?: number } = {},
): Promise<{ total_count: number; txs: TxRecord[] }> {
  return cvRequest<{ total_count: number; txs: TxRecord[] }>("/query_txs", {
    chain,
    address,
    ...opts,
  });
}

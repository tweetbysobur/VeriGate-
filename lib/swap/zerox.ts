/**
 * 0x Swap API v2 client (server-only). Uses the allowance-holder flow, which
 * returns ready-to-send transaction calldata (no Permit2 signature needed for
 * native sells like MON → USDC).
 *
 * Docs: https://0x.org/docs/developer-resources/swap-api
 */
import "server-only";
import { getSwapConfig } from "./config";

export interface SwapQuote {
  liquidityAvailable: boolean;
  buyAmount: string; // base units
  sellAmount: string; // base units
  minBuyAmount?: string;
  /** DEX sources the route fills through (for display). */
  sources: string[];
  /** Ready-to-send transaction (taker signs & sends). */
  transaction?: {
    to: string;
    data: string;
    value: string;
    gas?: string;
    gasPrice?: string;
  };
  /** Allowance requirement for ERC-20 sells (null for native MON). */
  allowanceTarget?: string | null;
}

export class SwapNotConfiguredError extends Error {
  constructor() {
    super("Swap is not configured. Set ZEROX_API_KEY to enable swaps.");
    this.name = "SwapNotConfiguredError";
  }
}

interface QuoteParams {
  sellToken: string;
  buyToken: string;
  sellAmount: string; // base units
  taker: string;
  slippageBps?: number;
}

async function call0x(path: string, params: QuoteParams) {
  const cfg = getSwapConfig();
  if (!cfg.enabled) throw new SwapNotConfiguredError();

  const qs = new URLSearchParams({
    chainId: String(cfg.chainId),
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
    ...(params.slippageBps ? { slippageBps: String(params.slippageBps) } : {}),
  });

  const res = await fetch(`${cfg.baseUrl}${path}?${qs}`, {
    headers: {
      "0x-api-key": cfg.apiKey,
      "0x-version": cfg.apiVersion,
    },
    cache: "no-store",
  });

  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (json?.reason as string) ||
      (json?.message as string) ||
      `0x API error ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

function extractSources(json: Record<string, unknown>): string[] {
  const route = json.route as { fills?: { source?: string }[] } | undefined;
  const fills = route?.fills ?? [];
  return Array.from(new Set(fills.map((f) => f.source).filter(Boolean) as string[]));
}

/** Firm quote with executable calldata. */
export async function getSwapQuote(params: QuoteParams): Promise<SwapQuote> {
  const json = await call0x("/swap/allowance-holder/quote", params);

  const issues = json.issues as { allowance?: { spender?: string } | null } | undefined;
  const tx = json.transaction as SwapQuote["transaction"] | undefined;

  return {
    liquidityAvailable: json.liquidityAvailable !== false,
    buyAmount: String(json.buyAmount ?? "0"),
    sellAmount: String(json.sellAmount ?? params.sellAmount),
    minBuyAmount: json.minBuyAmount ? String(json.minBuyAmount) : undefined,
    sources: extractSources(json),
    transaction: tx,
    allowanceTarget: issues?.allowance?.spender ?? null,
  };
}

/** Indicative price (no calldata) — lighter, for live quoting as the user types. */
export async function getSwapPrice(params: QuoteParams): Promise<SwapQuote> {
  const json = await call0x("/swap/allowance-holder/price", params);
  return {
    liquidityAvailable: json.liquidityAvailable !== false,
    buyAmount: String(json.buyAmount ?? "0"),
    sellAmount: String(json.sellAmount ?? params.sellAmount),
    minBuyAmount: json.minBuyAmount ? String(json.minBuyAmount) : undefined,
    sources: extractSources(json),
    allowanceTarget:
      (json.issues as { allowance?: { spender?: string } | null } | undefined)
        ?.allowance?.spender ?? null,
  };
}

/**
 * Swap configuration — 0x Swap API aggregator on Monad mainnet.
 *
 * 0x aggregates Monad DEX liquidity (Kuru, Crystal, Clober, OctoSwap, Atlantis,
 * IziSwap, Uniswap, …) and returns ready-to-execute swap calldata. The api-key
 * is server-side only.
 *
 *   ZEROX_API_KEY=...                 # from dashboard.0x.org (free tier)
 *   NEXT_PUBLIC_MONAD_CHAIN_ID=143    # Monad mainnet
 *   NEXT_PUBLIC_MONAD_USDC=0x...      # USDC on Monad mainnet (buy token)
 */

/** EIP-7528 native-asset sentinel (used by 0x for native MON). */
export const NATIVE_TOKEN = "0xEeeeeeEeeeeEeeeeeeEeeeeeeeeeeeeeeeeeEEeE";

export function getSwapConfig() {
  const apiKey = process.env.ZEROX_API_KEY ?? "";
  return {
    apiKey,
    enabled: !!apiKey,
    baseUrl: "https://api.0x.org",
    apiVersion: "v2",
    chainId: Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID ?? 143),
  };
}

export interface SwapToken {
  symbol: string;
  name: string;
  address: string; // NATIVE_TOKEN for MON
  decimals: number;
}

/**
 * Tokens selectable in the swap UI. Mainnet addresses come from env so they can
 * be set without a code change. MON is native (no address needed).
 */
export const SWAP_TOKENS: SwapToken[] = [
  { symbol: "MON", name: "Monad", address: NATIVE_TOKEN, decimals: 18 },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: process.env.NEXT_PUBLIC_MONAD_USDC ?? "",
    decimals: 6,
  },
];

export function swapToken(symbol: string): SwapToken | undefined {
  return SWAP_TOKENS.find((t) => t.symbol === symbol);
}

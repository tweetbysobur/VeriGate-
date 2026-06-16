/**
 * Dependency-free Monad (EVM) wallet helpers using the injected EIP-1193
 * provider (window.ethereum). Handles connect, chain switching, ERC-20
 * A-Token transfer, and receipt polling — no wagmi/viem needed.
 *
 * Client-only.
 */

export interface EvmChainConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrls: string[];
  explorerTx: (hash: string) => string;
  explorerUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
}

export const MONAD_MAINNET: EvmChainConfig = {
  chainId: 143,
  chainIdHex: "0x8f",
  name: "Monad",
  rpcUrls: ["https://rpc.monad.xyz", "https://monad-mainnet.drpc.org"],
  explorerUrl: "https://monadexplorer.com",
  explorerTx: (h) => `https://monadexplorer.com/tx/${h}`,
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
};

export const MONAD_TESTNET: EvmChainConfig = {
  chainId: 10143,
  chainIdHex: "0x279f",
  name: "Monad Testnet",
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  explorerUrl: "https://testnet.monadexplorer.com",
  explorerTx: (h) => `https://testnet.monadexplorer.com/tx/${h}`,
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
};

/**
 * Active Monad network. Testnet for the hackathon — guaranteed, so a stale
 * NEXT_PUBLIC_MONAD_NETWORK=mainnet in any deploy env cannot flip it. To enable
 * mainnet later, set the explicit fresh flag NEXT_PUBLIC_MONAD_MAINNET=1.
 */
export function monadConfig(): EvmChainConfig {
  return process.env.NEXT_PUBLIC_MONAD_MAINNET === "1"
    ? MONAD_MAINNET
    : MONAD_TESTNET;
}

/** The A-Token the customer pays with on Monad (override for mainnet). */
export function settlementAtoken(): { address: string; decimals: number } {
  return {
    address:
      process.env.NEXT_PUBLIC_MONAD_ATOKEN ??
      "0xaC0893567D43C3E7e6e35a72803df05416C1f20D", // sandbox aUSDC
    decimals: Number(process.env.NEXT_PUBLIC_MONAD_ATOKEN_DECIMALS ?? 6),
  };
}

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

export function getProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  return eth ?? null;
}

export function hasWallet(): boolean {
  return getProvider() !== null;
}

/** Request account access; returns the selected address (checksummed lowercase). */
export async function connect(): Promise<string> {
  const p = getProvider();
  if (!p) throw new Error("No wallet found. Install MetaMask or a Monad-compatible wallet.");
  const accounts = (await p.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts?.length) throw new Error("No account selected.");
  return accounts[0];
}

export async function currentAccount(): Promise<string | null> {
  const p = getProvider();
  if (!p) return null;
  const accounts = (await p.request({ method: "eth_accounts" })) as string[];
  return accounts?.[0] ?? null;
}

/** Ensure the wallet is on the given chain; add it if unknown. */
export async function ensureChain(cfg: EvmChainConfig): Promise<void> {
  const p = getProvider();
  if (!p) throw new Error("No wallet found.");
  try {
    await p.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: cfg.chainIdHex }],
    });
  } catch (err: unknown) {
    // 4902 = chain not added to the wallet → add it, then it becomes active.
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await p.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: cfg.chainIdHex,
            chainName: cfg.name,
            rpcUrls: cfg.rpcUrls,
            nativeCurrency: cfg.nativeCurrency,
            blockExplorerUrls: [cfg.explorerUrl],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

function pad32(hexNo0x: string): string {
  return hexNo0x.padStart(64, "0");
}

/** Encode ERC-20 transfer(address,uint256) calldata. */
export function encodeErc20Transfer(to: string, amountBaseUnits: bigint): string {
  const selector = "a9059cbb";
  const addr = pad32(to.toLowerCase().replace(/^0x/, ""));
  const amt = pad32(amountBaseUnits.toString(16));
  return `0x${selector}${addr}${amt}`;
}

/** Convert a decimal token amount to base units (bigint) for `decimals`. */
export function toBaseUnits(amount: number, decimals: number): bigint {
  // Avoid float drift: build the integer string with fixed decimals.
  const [whole, frac = ""] = amount.toString().split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(`${whole}${fracPadded}`);
}

/**
 * Send an A-Token (ERC-20) transfer from the connected account to `to`.
 * Returns the transaction hash. The A-Token contract enforces compliance
 * on-chain, so a non-compliant transfer will revert.
 */
export async function sendAtokenTransfer(params: {
  from: string;
  token: string;
  to: string;
  amount: number;
  decimals: number;
}): Promise<string> {
  const p = getProvider();
  if (!p) throw new Error("No wallet found.");
  const data = encodeErc20Transfer(
    params.to,
    toBaseUnits(params.amount, params.decimals),
  );
  const txHash = (await p.request({
    method: "eth_sendTransaction",
    params: [{ from: params.from, to: params.token, data, value: "0x0" }],
  })) as string;
  return txHash;
}

/** Send a pre-built transaction (e.g. 0x swap calldata). Returns the tx hash. */
export async function sendTransaction(tx: {
  from: string;
  to: string;
  data: string;
  value?: string; // hex wei
  gas?: string;
}): Promise<string> {
  const p = getProvider();
  if (!p) throw new Error("No wallet found.");
  const params: Record<string, string> = {
    from: tx.from,
    to: tx.to,
    data: tx.data,
    value: tx.value && tx.value !== "0" ? toHex(tx.value) : "0x0",
  };
  if (tx.gas) params.gas = toHex(tx.gas);
  return (await p.request({
    method: "eth_sendTransaction",
    params: [params],
  })) as string;
}

/** Decimal-or-hex string → 0x hex. */
function toHex(v: string): string {
  if (v.startsWith("0x")) return v;
  return `0x${BigInt(v).toString(16)}`;
}

/** Format base units (bigint string) to a human decimal string. */
export function formatUnits(baseUnits: string, decimals: number): string {
  const s = BigInt(baseUnits).toString().padStart(decimals + 1, "0");
  const whole = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}

/** Poll for a transaction receipt. Resolves with success/failure + receipt. */
export async function waitForReceipt(
  txHash: string,
  { timeoutMs = 90_000, intervalMs = 2_500 } = {},
): Promise<{ success: boolean; blockNumber?: number }> {
  const p = getProvider();
  if (!p) throw new Error("No wallet found.");
  const start = Date.now();
  for (;;) {
    const r = (await p.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    })) as { status?: string; blockNumber?: string } | null;
    if (r) {
      return {
        success: r.status === "0x1",
        blockNumber: r.blockNumber ? parseInt(r.blockNumber, 16) : undefined,
      };
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("Timed out waiting for transaction confirmation.");
    }
    await new Promise((res) => setTimeout(res, intervalMs));
  }
}

/**
 * VeriGate Settlement Contract — deployed on Monad Testnet.
 * Address is public (client-safe); override via NEXT_PUBLIC_SETTLEMENT_CONTRACT
 * if a new deployment supersedes this one.
 */
import { monadConfig } from "./monad";

export const SETTLEMENT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SETTLEMENT_CONTRACT ??
  "0x1Ab6d39444EbFb3e4F6EB9b31994243BE3A7d17C";

export type SettlementStatus = "pending" | "confirmed" | "failed";

export function settlementExplorerAddress(): string {
  return `${monadConfig().explorerUrl}/address/${SETTLEMENT_CONTRACT_ADDRESS}`;
}

export function settlementExplorerTx(hash: string): string {
  return monadConfig().explorerTx(hash);
}

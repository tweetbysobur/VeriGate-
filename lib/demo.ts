/**
 * Demo merchant + order + chain metadata for the Pay with VeriGate checkout.
 * Swap this out for real merchant/order data when integrating.
 */
import type { Chain } from "./cleanverse/types";

export const MERCHANT = {
  name: "Meridian Supply Co.",
  tagline: "Wholesale electronics · settles in compliant stablecoin",
  // Where settled funds land — echoed in the audit receipt.
  wallet: "0x121C439ff356e806C3da108eE794c4Dd485984d3",
  logoMark: "M",
};

export interface OrderLine {
  name: string;
  qty: number;
  unit: number;
}

export const ORDER: { lines: OrderLine[]; currency: string } = {
  currency: "USDC",
  lines: [
    { name: "USB-C Power Hub (65W)", qty: 2, unit: 38.0 },
    { name: "Mechanical Keyboard — Low Profile", qty: 1, unit: 119.0 },
    { name: "Priority shipping", qty: 1, unit: 14.0 },
  ],
};

export function orderTotals(order = ORDER) {
  const subtotal = order.lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const networkFee = 0.0; // gas sponsored in demo
  const total = subtotal + networkFee;
  return { subtotal, networkFee, total };
}

export interface ChainMeta {
  id: Chain;
  name: string;
  short: string;
  /** Tailwind classes for the chain chip. */
  tint: string;
  explorerTx: (hash: string) => string;
}

export const CHAINS: ChainMeta[] = [
  {
    id: "base",
    name: "Base",
    short: "BASE",
    tint: "bg-blue-500/10 text-blue-600 ring-blue-500/30",
    explorerTx: (h) => `https://basescan.org/tx/${h}`,
  },
  {
    id: "polygon",
    name: "Polygon",
    short: "POL",
    tint: "bg-violet-500/10 text-violet-600 ring-violet-500/30",
    explorerTx: (h) => `https://polygonscan.com/tx/${h}`,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    short: "ARB",
    tint: "bg-sky-500/10 text-sky-600 ring-sky-500/30",
    explorerTx: (h) => `https://arbiscan.io/tx/${h}`,
  },
  {
    id: "solana",
    name: "Solana",
    short: "SOL",
    tint: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30",
    explorerTx: (h) => `https://solscan.io/tx/${h}`,
  },
];

export function chainMeta(id: Chain): ChainMeta {
  return CHAINS.find((c) => c.id === id) ?? CHAINS[0];
}

export function shortAddr(addr: string, head = 6, tail = 4): string {
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function timeAgo(unixSeconds: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

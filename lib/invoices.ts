/**
 * In-process invoice store. Seeded with a couple of examples so the dashboard
 * looks alive. Payment links also carry the core fields as query params, so the
 * /pay/[id] page still works even if a cold serverless instance doesn't have the
 * invoice in memory. Swap for Vercel KV / Upstash for durable persistence.
 */
import "server-only";
import type { Chain, Invoice, InvoiceStatus } from "./cleanverse/types";
import { MERCHANT } from "./demo";

const HOUR = 3600;
const now = () => Math.floor(Date.now() / 1000);

function newId(): string {
  return `iv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

let store: Invoice[] = [
  {
    id: "iv_seedpaid01",
    merchantName: MERCHANT.name,
    merchantWallet: MERCHANT.wallet,
    item: "Wholesale order #4471",
    amount: 1340,
    currency: "USDC",
    chain: "monad",
    status: "paid",
    createdAt: now() - 6 * HOUR,
    paidAt: now() - 5 * HOUR,
    customer: "0x888895E314BF33CEeBCF5320279061aed3a5E2bd",
    apassTier: "40",
    txHash: "0x" + "a3f9c2".repeat(10) + "ab12",
  },
  {
    id: "iv_seedopen01",
    merchantName: MERCHANT.name,
    merchantWallet: MERCHANT.wallet,
    item: "Priority restock — keyboards",
    amount: 512,
    currency: "USDC",
    chain: "monad",
    status: "open",
    createdAt: now() - 40 * 60,
  },
];

export interface CreateInvoiceInput {
  item: string;
  amount: number;
  currency?: string;
  chain?: Chain;
}

export function createInvoice(input: CreateInvoiceInput): Invoice {
  const inv: Invoice = {
    id: newId(),
    merchantName: MERCHANT.name,
    merchantWallet: MERCHANT.wallet,
    item: input.item.trim() || "Invoice",
    amount: Math.max(0, Number(input.amount) || 0),
    currency: input.currency ?? "USDC",
    chain: input.chain ?? "monad",
    status: "open",
    createdAt: now(),
  };
  store = [inv, ...store].slice(0, 100);
  return inv;
}

export function getInvoice(id: string): Invoice | undefined {
  return store.find((i) => i.id === id);
}

export function listInvoices(): Invoice[] {
  return store;
}

export function markPaid(
  id: string,
  data: {
    customer?: string;
    apassTier?: string;
    txHash?: string;
    receipt?: { fileName: string; downloadUrl: string };
  },
): Invoice | undefined {
  const inv = store.find((i) => i.id === id);
  if (!inv) return undefined;
  inv.status = "paid" as InvoiceStatus;
  inv.paidAt = now();
  inv.customer = data.customer ?? inv.customer;
  inv.apassTier = data.apassTier ?? inv.apassTier;
  inv.txHash = data.txHash ?? inv.txHash;
  inv.receipt = data.receipt ?? inv.receipt;
  return inv;
}

/** Upsert a transient invoice reconstructed from a payment link's query params. */
export function ensureInvoice(partial: {
  id: string;
  item: string;
  amount: number;
  currency?: string;
  chain?: Chain;
}): Invoice {
  const existing = getInvoice(partial.id);
  if (existing) return existing;
  const inv: Invoice = {
    id: partial.id,
    merchantName: MERCHANT.name,
    merchantWallet: MERCHANT.wallet,
    item: partial.item || "Invoice",
    amount: Math.max(0, Number(partial.amount) || 0),
    currency: partial.currency ?? "USDC",
    chain: partial.chain ?? "monad",
    status: "open",
    createdAt: now(),
  };
  store = [inv, ...store].slice(0, 100);
  return inv;
}

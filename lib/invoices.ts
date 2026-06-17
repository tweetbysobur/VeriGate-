/**
 * Invoice store. Durable via KV when provisioned, otherwise in-process memory.
 * Payment links also carry the core fields as query params, so /pay/[id] works
 * even before KV is set up and across cold starts.
 */
import "server-only";
import type { Chain, Invoice, InvoiceStatus } from "./cleanverse/types";
import { MERCHANT } from "./demo";
import { kvEnabled, kvGetJson, kvSetJson } from "./kv";

const KEY = "verigate:invoices";
const now = () => Math.floor(Date.now() / 1000);

function newId(): string {
  return `iv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Real invoices only — created by the merchant on the site. No demo seed.
function seed(): Invoice[] {
  return [];
}

let mem: Invoice[] | null = null;

async function load(): Promise<Invoice[]> {
  if (kvEnabled) {
    let arr = await kvGetJson<Invoice[]>(KEY);
    if (!arr) {
      arr = seed();
      await kvSetJson(KEY, arr);
    }
    return arr;
  }
  if (mem === null) mem = seed();
  return mem;
}

async function save(list: Invoice[]): Promise<void> {
  const next = list.slice(0, 100);
  if (kvEnabled) await kvSetJson(KEY, next);
  else mem = next;
}

export interface CreateInvoiceInput {
  item: string;
  amount: number;
  currency?: string;
  chain?: Chain;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
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
  await save([inv, ...(await load())]);
  return inv;
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  return (await load()).find((i) => i.id === id);
}

export async function listInvoices(): Promise<Invoice[]> {
  return load();
}

export async function markPaid(
  id: string,
  data: {
    customer?: string;
    apassTier?: string;
    txHash?: string;
    onChain?: boolean;
    receipt?: { fileName: string; downloadUrl: string };
  },
): Promise<Invoice | undefined> {
  const list = await load();
  const inv = list.find((i) => i.id === id);
  if (!inv) return undefined;
  inv.status = "paid" as InvoiceStatus;
  inv.paidAt = now();
  inv.customer = data.customer ?? inv.customer;
  inv.apassTier = data.apassTier ?? inv.apassTier;
  inv.txHash = data.txHash ?? inv.txHash;
  inv.onChain = data.onChain ?? inv.onChain;
  inv.receipt = data.receipt ?? inv.receipt;
  await save(list);
  return inv;
}

/** Upsert a transient invoice reconstructed from a payment link's query params. */
export async function ensureInvoice(partial: {
  id: string;
  item: string;
  amount: number;
  currency?: string;
  chain?: Chain;
}): Promise<Invoice> {
  const existing = await getInvoice(partial.id);
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
  await save([inv, ...(await load())]);
  return inv;
}

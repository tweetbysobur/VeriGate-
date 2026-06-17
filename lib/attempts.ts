/**
 * Payment-attempt ledger. Durable via KV when provisioned (Vercel KV / Upstash),
 * otherwise in-process memory. Seeded with plausible history so the dashboard
 * looks alive; real demo activity (settled + blocked) is prepended at runtime.
 */
import "server-only";
import type { PaymentRecord } from "./cleanverse/types";
import { kvEnabled, kvGetJson, kvSetJson } from "./kv";

const MAX = 60;
const KEY = "verigate:attempts";

// Real activity only — no seeded demo data. Records are appended as real
// payments (settled/blocked) happen on the site.
let mem: PaymentRecord[] | null = null;

async function load(): Promise<PaymentRecord[]> {
  if (kvEnabled) {
    return (await kvGetJson<PaymentRecord[]>(KEY)) ?? [];
  }
  if (mem === null) mem = [];
  return mem;
}

export async function recordAttempt(rec: PaymentRecord): Promise<void> {
  const next = [rec, ...(await load())].slice(0, MAX);
  if (kvEnabled) await kvSetJson(KEY, next);
  else mem = next;
}

export async function listAttempts(): Promise<PaymentRecord[]> {
  return load();
}

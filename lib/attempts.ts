/**
 * In-process payment-attempt ledger. Seeded with plausible history so the
 * dashboard looks alive, then real demo activity (settled + blocked) is
 * prepended at runtime by /api/attempts. This makes the dashboard reflect what
 * actually happened during a session rather than static mock data.
 *
 * Note: per-instance memory — fine for a demo session; swap for Vercel KV /
 * Upstash for durable multi-instance persistence.
 */
import "server-only";
import type { PaymentRecord } from "./cleanverse/types";
import { mockPayments } from "./cleanverse/mock";

const MAX = 60;
let store: PaymentRecord[] = mockPayments();

export function recordAttempt(rec: PaymentRecord): void {
  store = [rec, ...store].slice(0, MAX);
}

export function listAttempts(): PaymentRecord[] {
  return store;
}

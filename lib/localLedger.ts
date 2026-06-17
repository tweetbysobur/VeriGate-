/**
 * Browser-side transaction ledger (localStorage).
 *
 * Serverless instances on Vercel don't share in-memory state, so a payment
 * recorded by the API lambda never reaches the page-render lambda without an
 * external store (KV). This client-side ledger makes a user's *own* real
 * activity show up reliably on their device — every payment they run on the
 * site, with its real Monad tx hash — no provisioning required.
 *
 * (When Vercel KV is provisioned, the server ledger also works, e.g. for
 * multi-device / merchant back-office views.)
 */
import type { PaymentRecord } from "./cleanverse/types";

const KEY = "verigate:txns";
const MAX = 100;

export function listLocal(): PaymentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PaymentRecord[]) : [];
  } catch {
    return [];
  }
}

export function recordLocal(rec: PaymentRecord): void {
  if (typeof window === "undefined") return;
  try {
    const next = [rec, ...listLocal()].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function newTxnId(): string {
  return `VG-${Date.now().toString(36).toUpperCase()}`;
}

import type { PaymentRecord } from "./cleanverse/types";

/** Merge the durable server ledger (KV) with a browser's local records.
 *  Dedupe by id, then by a content signature so the same payment recorded
 *  both server-side and locally doesn't appear twice. Newest first. */
export function mergeLedgers(
  server: PaymentRecord[],
  local: PaymentRecord[],
): PaymentRecord[] {
  const byId = new Map<string, PaymentRecord>();
  const sig = (p: PaymentRecord) =>
    `${p.customer}|${p.amount}|${p.status}|${p.txHash ?? ""}|${Math.round(p.createdAt / 30)}`;
  const seenSig = new Set<string>();

  for (const p of [...server, ...local]) {
    if (p.id && byId.has(p.id)) continue;
    const s = sig(p);
    if (seenSig.has(s)) continue;
    seenSig.add(s);
    if (p.id) byId.set(p.id, p);
    else byId.set(s, p);
  }
  return [...byId.values()].sort((a, b) => b.createdAt - a.createdAt);
}

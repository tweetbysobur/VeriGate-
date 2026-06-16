import { NextRequest, NextResponse } from "next/server";
import { listAttempts, recordAttempt } from "@/lib/attempts";
import type { Chain, PaymentRecord, PaymentStatus } from "@/lib/cleanverse/types";

export async function GET() {
  return NextResponse.json({ attempts: await listAttempts() });
}

interface Body {
  customer?: string;
  chain?: Chain;
  amount?: number | string;
  currency?: string;
  status?: PaymentStatus;
  blockReason?: string;
  apassTier?: string;
  txHash?: string;
  onChain?: boolean;
  receipt?: { fileName: string; downloadUrl: string };
}

export async function POST(req: NextRequest) {
  let b: Body;
  try {
    b = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rec: PaymentRecord = {
    id: `VG-${Date.now().toString().slice(-7)}`,
    createdAt: Math.floor(Date.now() / 1000),
    customer: b.customer ?? "",
    chain: (b.chain ?? "monad") as Chain,
    amount: Number(b.amount) || 0,
    currency: b.currency ?? "USDC",
    status: b.status === "blocked" ? "blocked" : "settled",
    blockReason: b.blockReason,
    apassTier: b.apassTier,
    txHash: b.txHash,
    onChain: b.onChain,
    receipt: b.receipt,
  };
  await recordAttempt(rec);
  return NextResponse.json({ ok: true, id: rec.id });
}

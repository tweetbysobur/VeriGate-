import { NextRequest, NextResponse } from "next/server";
import { ensureInvoice, markPaid } from "@/lib/invoices";
import type { Chain } from "@/lib/cleanverse/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: {
    customer?: string;
    apassTier?: string;
    txHash?: string;
    receipt?: { fileName: string; downloadUrl: string };
    // fallback fields to reconstruct a transient invoice if not in memory
    item?: string;
    amount?: number;
    currency?: string;
    chain?: Chain;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Ensure the invoice exists (cold-instance resilience via link params).
  if (body.item && body.amount) {
    await ensureInvoice({
      id,
      item: body.item,
      amount: body.amount,
      currency: body.currency,
      chain: body.chain,
    });
  }

  const inv = await markPaid(id, {
    customer: body.customer,
    apassTier: body.apassTier,
    txHash: body.txHash,
    receipt: body.receipt,
  });
  if (!inv) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, invoice: inv });
}

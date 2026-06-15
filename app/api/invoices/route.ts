import { NextRequest, NextResponse } from "next/server";
import { createInvoice, listInvoices } from "@/lib/invoices";

export async function GET() {
  return NextResponse.json({ invoices: listInvoices() });
}

export async function POST(req: NextRequest) {
  let body: { item?: string; amount?: number | string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const amount = Number(body.amount);
  if (!body.item || !amount || amount <= 0) {
    return NextResponse.json(
      { error: "item and a positive amount are required" },
      { status: 400 },
    );
  }
  const invoice = createInvoice({ item: String(body.item), amount });
  return NextResponse.json({ ok: true, invoice });
}

import { NextRequest, NextResponse } from "next/server";
import { requestFaucet } from "@/lib/cleanverse/client";
import type { Chain } from "@/lib/cleanverse/types";

interface Body {
  chain: Chain;
  symbol: string;
  depositAddress: string;
  amount: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.chain || !body.symbol || !body.depositAddress || !body.amount) {
    return NextResponse.json(
      { error: "chain, symbol, depositAddress and amount are required" },
      { status: 400 },
    );
  }

  try {
    const result = await requestFaucet(
      body.chain,
      body.symbol,
      body.depositAddress,
      body.amount,
    );
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Faucet request failed" },
      { status: 502 },
    );
  }
}

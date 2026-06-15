import { NextRequest, NextResponse } from "next/server";
import { getSwapPrice, getSwapQuote, SwapNotConfiguredError } from "@/lib/swap/zerox";
import { swapToken } from "@/lib/swap/config";

interface Body {
  sellSymbol: string;
  buySymbol: string;
  sellAmount: string; // human decimal, e.g. "1.5"
  taker: string;
  mode?: "price" | "quote";
}

/** Decimal amount → base units string, float-drift-free. */
function toBaseUnits(amount: string, decimals: number): string {
  const [whole, frac = ""] = amount.trim().split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(`${whole || "0"}${fracPadded}`).toString();
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sell = swapToken(body.sellSymbol);
  const buy = swapToken(body.buySymbol);
  if (!sell || !buy) {
    return NextResponse.json({ error: "Unknown token" }, { status: 400 });
  }
  if (!buy.address) {
    return NextResponse.json(
      { error: `${buy.symbol} address is not configured (set NEXT_PUBLIC_MONAD_USDC).` },
      { status: 400 },
    );
  }
  if (!body.taker) {
    return NextResponse.json({ error: "Connect a wallet first." }, { status: 400 });
  }
  const amt = Number(body.sellAmount);
  if (!amt || amt <= 0) {
    return NextResponse.json({ error: "Enter an amount." }, { status: 400 });
  }

  const params = {
    sellToken: sell.address,
    buyToken: buy.address,
    sellAmount: toBaseUnits(body.sellAmount, sell.decimals),
    taker: body.taker,
    slippageBps: 100, // 1%
  };

  try {
    const quote =
      body.mode === "quote"
        ? await getSwapQuote(params)
        : await getSwapPrice(params);
    return NextResponse.json({
      ok: true,
      quote,
      sell: { symbol: sell.symbol, decimals: sell.decimals },
      buy: { symbol: buy.symbol, decimals: buy.decimals },
    });
  } catch (err) {
    if (err instanceof SwapNotConfiguredError) {
      return NextResponse.json(
        { ok: false, notConfigured: true, error: err.message },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Swap quote failed" },
      { status: 502 },
    );
  }
}

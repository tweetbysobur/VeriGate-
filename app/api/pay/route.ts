import { NextRequest, NextResponse } from "next/server";
import {
  stepAsset,
  stepAudit,
  stepCompliance,
  stepIdentity,
  stepSettle,
} from "@/lib/cleanverse/client";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import { PERSONAS } from "@/lib/cleanverse/mock";
import type { Chain, PaymentStepId, Persona } from "@/lib/cleanverse/types";

/** Simulated network/chain latency per step (mock mode only). */
const LATENCY: Record<PaymentStepId, number> = {
  identity: 850,
  asset: 700,
  compliance: 950,
  settle: 1400,
  audit: 800,
};

interface Body {
  step: PaymentStepId;
  chain: Chain;
  persona: Persona;
  address?: string;
  amount?: string;
  merchant?: string;
  txHash?: string;
  realSettle?: boolean;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { step, chain, persona } = body;
  if (!step || !chain || !persona) {
    return NextResponse.json(
      { error: "step, chain and persona are required" },
      { status: 400 },
    );
  }

  const { mode } = getCleanverseConfig();
  // Resolve the wallet address: explicit (live wallet) or the persona's demo address.
  const address = body.address ?? PERSONAS[persona]?.address ?? "";
  const ctx = { chain, persona, address };

  // Only inject artificial latency in mock mode; live calls have real latency.
  if (mode === "mock") {
    await new Promise((r) => setTimeout(r, LATENCY[step] ?? 700));
  }

  try {
    switch (step) {
      case "identity":
        return NextResponse.json(await stepIdentity(ctx));
      case "asset":
        return NextResponse.json(await stepAsset(ctx));
      case "compliance":
        return NextResponse.json(await stepCompliance(ctx));
      case "settle":
        return NextResponse.json(
          await stepSettle(ctx, body.amount ?? "0", body.merchant ?? ""),
        );
      case "audit":
        return NextResponse.json(
          await stepAudit(ctx, body.txHash ?? "0x0", !body.realSettle),
        );
      default:
        return NextResponse.json({ error: "Unknown step" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Step failed" },
      { status: 500 },
    );
  }
}

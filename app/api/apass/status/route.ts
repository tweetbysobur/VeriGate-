import { NextRequest, NextResponse } from "next/server";
import { checkApass } from "@/lib/cleanverse/client";
import { getCleanverseConfig } from "@/lib/cleanverse/config";
import type { Chain } from "@/lib/cleanverse/types";

export async function POST(req: NextRequest) {
  let body: { chain: Chain; address: string };
  try {
    body = (await req.json()) as { chain: Chain; address: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.chain || !body.address) {
    return NextResponse.json(
      { error: "chain and address are required" },
      { status: 400 },
    );
  }
  const result = await checkApass(body.chain, body.address);
  const { mode, env } = getCleanverseConfig();
  // Surface the environment so the UI can be honest that the Cleanverse
  // *sandbox* verifies all test wallets — production enforces real KYC.
  return NextResponse.json({
    ...result,
    mode,
    env,
    sandbox: mode === "live" && env === "sandbox",
  });
}

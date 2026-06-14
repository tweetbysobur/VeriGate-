import { NextRequest, NextResponse } from "next/server";
import { issueApass } from "@/lib/cleanverse/client";
import type { ApassIssueInput } from "@/lib/cleanverse/types";

export async function POST(req: NextRequest) {
  let body: ApassIssueInput;
  try {
    body = (await req.json()) as ApassIssueInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.address || !body.chain || !body.fullName || !body.idType || !body.issuingCountryISO2) {
    return NextResponse.json(
      { error: "address, chain, fullName, idType and issuingCountryISO2 are required" },
      { status: 400 },
    );
  }

  try {
    const result = await issueApass(body);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "A-Pass issuance failed" },
      { status: 502 },
    );
  }
}

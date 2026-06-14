import { NextResponse } from "next/server";
import { checkConnectivity } from "@/lib/cleanverse/client";

/** Diagnostic: confirms Cleanverse connectivity without exposing any secret. */
export async function GET() {
  const result = await checkConnectivity();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

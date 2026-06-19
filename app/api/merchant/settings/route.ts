import { kv } from "@vercel/kv";
import { MERCHANT } from "@/lib/demo";

export const runtime = "nodejs";

export async function GET() {
  try {
    const payoutAddress = await kv.get<string>(`merchant:${MERCHANT.wallet}:payout`);
    return Response.json({
      ok: true,
      result: {
        wallet: MERCHANT.wallet,
        payoutAddress: payoutAddress || MERCHANT.wallet,
        name: MERCHANT.name,
      },
    });
  } catch (error) {
    return Response.json({ ok: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payoutAddress } = body;

    // Validate address format
    if (!payoutAddress || !/^0x[a-fA-F0-9]{40}$/.test(payoutAddress)) {
      return Response.json(
        { ok: false, error: "Invalid payout address format" },
        { status: 400 }
      );
    }

    // Prevent self-payment
    if (payoutAddress.toLowerCase() === MERCHANT.wallet.toLowerCase()) {
      return Response.json(
        { ok: false, error: "Payout address cannot be the same as merchant wallet" },
        { status: 400 }
      );
    }

    // Store in KV
    await kv.set(`merchant:${MERCHANT.wallet}:payout`, payoutAddress);

    return Response.json({
      ok: true,
      result: {
        wallet: MERCHANT.wallet,
        payoutAddress,
        message: "Payout address updated successfully",
      },
    });
  } catch (error) {
    return Response.json({ ok: false, error: "Failed to update settings" }, { status: 500 });
  }
}

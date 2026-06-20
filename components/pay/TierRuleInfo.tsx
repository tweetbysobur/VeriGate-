"use client";

/**
 * Tier Rule Info: Shows why a tier has certain transfer limits.
 * Displays: Tier number, max transaction size, why the limit exists, and whether
 * the current payment is within limits.
 */

interface TierRuleInfoProps {
  tier?: string;
  paymentAmount?: number;
}

const TIER_LIMITS: Record<string, { limit: number; description: string }> = {
  "10": { limit: 0.10, description: "Starter: Basic KYC verification, limited transaction size for fraud prevention" },
  "20": { limit: 0.50, description: "Standard: Full KYC verified, AML-screened, per-transaction limit for risk management" },
  "30": { limit: 5, description: "Professional: Enhanced KYC, OFAC cleared, higher limits for business users" },
  "40": { limit: 50, description: "Institutional: Full compliance verified, no daily limit, dedicated support" },
  "50": { limit: 500, description: "Enterprise: Regulatory approval, batch payments allowed, API access" },
};

export function TierRuleInfo({ tier, paymentAmount = 0 }: TierRuleInfoProps) {
  if (!tier) return null;

  const tierRule = TIER_LIMITS[tier];
  if (!tierRule) return null;

  const { limit, description } = tierRule;
  const withinLimit = paymentAmount <= limit;

  return (
    <div className="rounded-xl border border-verify-500/30 bg-verify-500/5 p-4">
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-verify-500" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />
        </svg>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Tier {tier} Compliance Rule</p>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                withinLimit
                  ? "bg-verify-500/20 text-verify-600"
                  : "bg-danger/20 text-danger"
              }`}
            >
              Max ${limit.toFixed(2)} per transaction
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{description}</p>
          {paymentAmount > 0 && (
            <div className="mt-3 rounded-lg bg-background/50 p-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Your payment: ${paymentAmount.toFixed(2)}</span>
                {withinLimit ? (
                  <span className="flex items-center gap-1 font-medium text-verify-600">
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Within limit
                  </span>
                ) : (
                  <span className="font-medium text-danger">
                    ⚠ Exceeds tier {tier} limit
                  </span>
                )}
              </div>
              {!withinLimit && (
                <p className="mt-2 text-[10px] text-danger">
                  Upgrade your A-Pass tier to higher verification level to send larger amounts.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

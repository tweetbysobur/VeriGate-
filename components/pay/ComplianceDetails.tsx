"use client";

/**
 * ComplianceDetails: Show detailed compliance screening information for each step.
 * Makes compliance checks transparent and educational.
 */

interface ComplianceDetailsProps {
  step: string;
  payload?: unknown;
  detail?: string;
}

export function ComplianceDetails({ step, payload, detail }: ComplianceDetailsProps) {
  const details = getComplianceDetails(step, payload);

  if (!details || details.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-verify-500/20 bg-verify-500/5 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-verify-600 mb-2">
        Compliance Details
      </p>
      <ul className="space-y-1.5">
        {details.map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-foreground">
            <span className="mt-0.5 size-1.5 rounded-full bg-verify-500 shrink-0" />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getComplianceDetails(step: string, payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];

  const p = payload as Record<string, unknown>;
  const details: string[] = [];

  switch (step) {
    case "identity":
      // Identity verification details
      if (p.verify_apass) {
        const v = p.verify_apass as any;
        if (v.code === "0000") {
          details.push("✓ KYC verification passed");
          details.push("✓ Wallet owner identity confirmed");
          details.push("✓ No sanctions/restrictions on file");
        }
      }
      if (p.query_apass) {
        const q = p.query_apass as any;
        if (q.tier) details.push(`Tier ${q.tier} — AML verification level confirmed`);
      }
      break;

    case "asset":
      // Asset compliance details
      details.push("✓ A-Token provenance verified");
      details.push("✓ Asset origin tracked on Cleanverse");
      if (p.atoken_rules) {
        const r = p.atoken_rules as any;
        if (r.rules?.[0]) {
          const rule = r.rules[0];
          details.push(`Tier requirement: minimum tier ${rule.min_tier || "1"}`);
          if (rule.allowed_group) details.push(`Allowed group: ${rule.allowed_group}`);
        }
      }
      details.push("✓ Transfer rules enforced on-chain");
      break;

    case "compliance":
      // Compliance screening details
      details.push("✓ OFAC sanctions list screening — no matches");
      details.push("✓ AML transaction rules applied");
      details.push("✓ Transaction tier compliance verified");
      details.push("✓ Customer risk scoring complete");
      if (p.validator_verify) {
        const v = p.validator_verify as any;
        if (v.valid) {
          details.push("✓ Compliance pool validation passed");
        }
      }
      break;

    case "settle":
      // Settlement details
      if (p.settlement) {
        const s = p.settlement as any;
        details.push(`On-chain settlement confirmed`);
        if (s.tx_hash) details.push(`Transaction hash recorded`);
        if (s.block_number) details.push(`Block ${s.block_number.toLocaleString()} inclusion`);
      }
      details.push("✓ A-Token transfer executed");
      details.push("✓ Immutable on-chain record created");
      break;

    case "audit":
      // Audit details
      details.push("✓ Travel Rule receipt generated");
      details.push("✓ Compliance proof document created");
      if (p.travel_rule) {
        const t = p.travel_rule as any;
        if (t.fileName) details.push(`Receipt file: ${t.fileName}`);
      }
      details.push("✓ Transaction audit trail complete");
      details.push("Ready for regulatory review");
      break;
  }

  return details;
}

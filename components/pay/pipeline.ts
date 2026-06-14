import type {
  Chain,
  PaymentStepId,
  Persona,
  StepStatus,
} from "@/lib/cleanverse/types";

export interface StepDef {
  id: PaymentStepId;
  label: string;
  /** What this step proves, shown under the label. */
  blurb: string;
  /** Cleanverse endpoint(s) backing the step — shown in the inspector. */
  endpoint: string;
}

export const STEP_DEFS: StepDef[] = [
  {
    id: "identity",
    label: "Verify identity",
    blurb: "A-Pass confirms the customer is a real, verified participant.",
    endpoint: "POST /verify_apass",
  },
  {
    id: "asset",
    label: "Check asset compliance",
    blurb: "A-Token carries provenance and regulatory controls.",
    endpoint: "POST /atoken/rules",
  },
  {
    id: "compliance",
    label: "Run compliance",
    blurb: "Automated rules screen the transaction on-chain.",
    endpoint: "POST /validator/verify",
  },
  {
    id: "settle",
    label: "Settle",
    blurb: "Fast, low-cost on-chain settlement.",
    endpoint: "on-chain transfer",
  },
  {
    id: "audit",
    label: "Write audit record",
    blurb: "An auditable Travel Rule receipt is written.",
    endpoint: "POST /download_travel_rule",
  },
];

export interface StepState {
  id: PaymentStepId;
  status: StepStatus;
  title?: string;
  detail?: string;
  payload?: unknown;
  source?: "live" | "simulated";
  action?: { label: string; href: string };
}

export interface ServerOutcome {
  ok: boolean;
  title: string;
  detail: string;
  payload: unknown;
  source?: "live" | "simulated";
  action?: { label: string; href: string };
  txHash?: string;
  report?: { downloadUrl: string; fileName: string };
}

export function initialSteps(): StepState[] {
  return STEP_DEFS.map((s) => ({ id: s.id, status: "idle" as StepStatus }));
}

export async function callStep(args: {
  step: PaymentStepId;
  chain: Chain;
  persona: Persona;
  address?: string;
  amount?: string;
  merchant?: string;
  txHash?: string;
  /** When true, the audit step pulls a real Travel Rule receipt for the txHash. */
  realSettle?: boolean;
}): Promise<ServerOutcome> {
  const res = await fetch("/api/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? `Step ${args.step} failed (${res.status})`);
  }
  return (await res.json()) as ServerOutcome;
}

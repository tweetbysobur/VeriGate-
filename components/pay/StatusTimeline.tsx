import type { StepState } from "./pipeline";

export type TimelineStageStatus = "done" | "active" | "pending" | "failed";

export interface TimelineStage {
  label: string;
  status: TimelineStageStatus;
}

export const TIMELINE_LABELS = [
  "Invoice created",
  "Customer verified",
  "Compliance passed",
  "Settlement submitted",
  "Settlement confirmed",
] as const;

/** Derive the 5-stage settlement timeline from the live pipeline step states. */
export function timelineFromSteps(
  steps: StepState[],
  phase: "review" | "running" | "success" | "failed",
): TimelineStage[] {
  const byId = (id: string) => steps.find((s) => s.id === id);
  const identity = byId("identity");
  const compliance = byId("compliance");
  const settle = byId("settle");
  const audit = byId("audit");

  const stageStatus = (
    step: StepState | undefined,
    fallbackActive: boolean,
  ): TimelineStageStatus => {
    if (!step || step.status === "idle") return fallbackActive ? "active" : "pending";
    if (step.status === "passed") return "done";
    if (step.status === "failed") return "failed";
    return "active";
  };

  return [
    { label: TIMELINE_LABELS[0], status: "done" },
    { label: TIMELINE_LABELS[1], status: stageStatus(identity, phase === "running") },
    { label: TIMELINE_LABELS[2], status: stageStatus(compliance, false) },
    { label: TIMELINE_LABELS[3], status: stageStatus(settle, false) },
    {
      label: TIMELINE_LABELS[4],
      status:
        phase === "success" && audit?.status === "passed"
          ? "done"
          : stageStatus(settle?.status === "passed" ? audit : undefined, false),
    },
  ];
}

const DOT_TINT: Record<TimelineStageStatus, string> = {
  done: "bg-verify-500 text-white",
  active: "bg-brand-500 text-white",
  pending: "bg-border text-muted",
  failed: "bg-danger text-white",
};

const LINE_TINT: Record<TimelineStageStatus, string> = {
  done: "bg-verify-500",
  active: "bg-brand-300",
  pending: "bg-border",
  failed: "bg-danger/50",
};

/** Horizontal/vertical progress timeline for the 5 settlement stages. */
export function StatusTimeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <ol className="flex flex-col gap-0">
      {stages.map((s, i) => (
        <li key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${DOT_TINT[s.status]}`}
            >
              {s.status === "done" ? (
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : s.status === "failed" ? (
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            {i < stages.length - 1 && (
              <span className={`w-px flex-1 ${LINE_TINT[s.status]}`} style={{ minHeight: 18 }} />
            )}
          </div>
          <p
            className={`pb-4 text-xs font-medium ${
              s.status === "pending" ? "text-muted" : "text-foreground"
            }`}
          >
            {s.label}
          </p>
        </li>
      ))}
    </ol>
  );
}

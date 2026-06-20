"use client";

import { useState } from "react";
import type { StepDef, StepState } from "./pipeline";
import { ComplianceDetails } from "./ComplianceDetails";

function StatusIcon({ status }: { status: StepState["status"] }) {
  if (status === "passed") {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-verify-500 text-white vg-pop">
        <svg viewBox="0 0 24 24" className="vg-check size-4" fill="none">
          <path
            d="m5 13 4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-danger text-white vg-pop">
        <svg viewBox="0 0 24 24" className="size-4" fill="none">
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="relative grid size-7 place-items-center">
        <span className="absolute size-7 rounded-full bg-brand-400/40 [animation:vg-pulse-ring_1.4s_ease-out_infinite]" />
        <span className="size-5 rounded-full border-2 border-brand-200 border-t-brand-500 vg-spin" />
      </span>
    );
  }
  // idle
  return (
    <span className="grid size-7 place-items-center rounded-full border border-border bg-background text-muted">
      <span className="size-2 rounded-full bg-border" />
    </span>
  );
}

export function StepRow({
  def,
  state,
  isLast,
}: {
  def: StepDef;
  state: StepState;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = state.status !== "idle";

  return (
    <li className="relative flex gap-3">
      {/* connector */}
      {!isLast && (
        <span
          className={`absolute left-[13px] top-8 h-[calc(100%-12px)] w-px ${
            state.status === "passed" ? "bg-verify-500/40" : "bg-border"
          }`}
        />
      )}
      <div className="z-10 pt-0.5">
        <StatusIcon status={state.status} />
      </div>
      <div className={`flex-1 pb-5 transition-opacity ${active ? "opacity-100" : "opacity-55"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            {state.title ?? def.label}
          </p>
          {state.payload != null && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] text-muted ring-1 ring-border hover:bg-background"
            >
              {open ? "hide" : "view"} JSON
            </button>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {state.detail ?? def.blurb}
        </p>

        {/* Compliance details — show what was screened */}
        {state.status !== "idle" && state.status !== "running" && (
          <ComplianceDetails step={state.id} payload={state.payload} detail={state.detail} />
        )}

        {/* running progress bar */}
        {state.status === "running" && (
          <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-brand-100">
            <div className="vg-indeterminate absolute inset-0" />
          </div>
        )}

        {/* action CTA on failure */}
        {state.status === "failed" && state.action && (
          <a
            href={state.action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
          >
            {state.action.label}
            <span aria-hidden>→</span>
          </a>
        )}

        {/* endpoint tag + live/sim source */}
        {active && (
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted/70">
            <span>{def.endpoint}</span>
            {state.source && (
              <span
                className={`rounded px-1 py-px text-[9px] font-semibold not-italic ${
                  state.source === "live"
                    ? "bg-verify-500/15 text-verify-600"
                    : "bg-brand-100 text-brand-600"
                }`}
              >
                {state.source}
              </span>
            )}
          </p>
        )}

        {/* JSON inspector */}
        {open && state.payload != null && (
          <pre className="mt-2 max-h-52 overflow-auto rounded-lg bg-brand-ink p-3 font-mono text-[10.5px] leading-relaxed text-brand-100">
            {JSON.stringify(state.payload, null, 2)}
          </pre>
        )}
      </div>
    </li>
  );
}

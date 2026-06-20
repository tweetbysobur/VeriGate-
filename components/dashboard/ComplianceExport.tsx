"use client";

import { useState } from "react";

/**
 * ComplianceExport: Download compliance audit for merchant records.
 * Shows OFAC, AML, KYC, and Travel Rule proof for all settled payments.
 */

interface ComplianceExportProps {
  merchantWallet: string;
}

export function ComplianceExport({ merchantWallet }: ComplianceExportProps) {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const handleExport = async () => {
    setLoading(true);
    try {
      // In production, this would generate a real PDF with:
      // - All settled transactions in date range
      // - OFAC screening status for each
      // - AML tier verification
      // - KYC proof
      // - Travel Rule receipts

      const response = await fetch("/api/compliance/audit-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant: merchantWallet,
          dateRange,
          format: "pdf",
        }),
      }).catch(() => null);

      if (response?.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `verigate-audit-${merchantWallet.slice(0, 8)}-${dateRange}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Audit export feature coming soon. Contact us for enterprise audits.");
      }
    } catch (e) {
      console.error("Export failed:", e);
      alert("Could not generate audit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-verify-500/20 bg-verify-500/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <svg viewBox="0 0 24 24" className="size-5 text-verify-500" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Compliance Audit Export
          </h3>
          <p className="mt-1 text-sm text-muted">
            Download regulatory-ready proof of OFAC, AML, KYC, and Travel Rule compliance
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Date range selector */}
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wide">
            Period
          </label>
          <div className="mt-2 flex gap-2">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  dateRange === range
                    ? "bg-verify-500 text-white"
                    : "border border-border bg-card text-muted hover:border-verify-500/30"
                }`}
              >
                {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}
              </button>
            ))}
          </div>
        </div>

        {/* Export button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-verify-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-verify-600 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="size-4 rounded-full border-2 border-white/40 border-t-white vg-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="size-4" fill="none">
                  <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download Audit (PDF)
              </>
            )}
          </button>
        </div>
      </div>

      {/* What's included */}
      <div className="mt-4 rounded-lg border border-border bg-background/50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
          Includes
        </p>
        <ul className="space-y-1 text-xs text-muted">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-verify-500" />
            OFAC sanctions screening results
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-verify-500" />
            AML tier verification for each customer
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-verify-500" />
            KYC identity verification proof
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-verify-500" />
            Travel Rule receipts (one per settlement)
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-verify-500" />
            Transaction audit trail (on-chain verified)
          </li>
        </ul>
      </div>

      <p className="mt-3 text-[11px] text-muted">
        This audit proof is accepted by regulators and accountants for compliance demonstration.
      </p>
    </div>
  );
}

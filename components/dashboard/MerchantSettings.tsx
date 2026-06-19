"use client";

import { useState, useEffect } from "react";
import { shortAddr } from "@/lib/demo";

interface MerchantSettings {
  wallet: string;
  payoutAddress: string;
  name: string;
}

export function MerchantSettings() {
  const [settings, setSettings] = useState<MerchantSettings | null>(null);
  const [editingPayout, setEditingPayout] = useState(false);
  const [newPayoutAddress, setNewPayoutAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/merchant/settings");
      const data = await res.json();
      if (data.ok) {
        setSettings(data.result);
        setNewPayoutAddress(data.result.payoutAddress);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }

  async function updatePayoutAddress() {
    if (!newPayoutAddress || !/^0x[a-fA-F0-9]{40}$/.test(newPayoutAddress)) {
      setMessage({ type: "error", text: "Invalid address format" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/merchant/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutAddress: newPayoutAddress }),
      });
      const data = await res.json();
      if (data.ok) {
        setSettings(data.result);
        setEditingPayout(false);
        setMessage({ type: "success", text: "Payout address updated" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Update failed" });
    } finally {
      setLoading(false);
    }
  }

  if (!settings) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">Settlement Address</h3>
      <p className="mt-1 text-sm text-muted">
        Where aUSDC settlements will be sent on Monad
      </p>

      {editingPayout ? (
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-muted">New payout address</label>
            <input
              type="text"
              value={newPayoutAddress}
              onChange={(e) => setNewPayoutAddress(e.target.value)}
              placeholder="0x..."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={updatePayoutAddress}
              disabled={loading}
              className="flex-1 rounded-lg bg-verify-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-verify-600 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Confirm"}
            </button>
            <button
              onClick={() => {
                setEditingPayout(false);
                setNewPayoutAddress(settings.payoutAddress);
              }}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-card"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="rounded-lg border border-border bg-background/50 px-3 py-3">
            <p className="font-mono text-xs text-foreground">{shortAddr(settings.payoutAddress)}</p>
          </div>
          <button
            onClick={() => setEditingPayout(true)}
            className="mt-3 text-xs font-semibold text-brand-500 hover:text-brand-600"
          >
            Change address →
          </button>
        </div>
      )}

      {message && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
            message.type === "success"
              ? "border border-verify-500/30 bg-verify-500/5 text-verify-600"
              : "border border-danger/30 bg-danger/5 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

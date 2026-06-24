import {
  SETTLEMENT_CONTRACT_ADDRESS,
  settlementExplorerAddress,
  settlementExplorerTx,
  type SettlementStatus,
} from "@/lib/web3/settlement";
import { shortAddr } from "@/lib/demo";

const STATUS_LABEL: Record<SettlementStatus, string> = {
  pending: "Pending confirmation",
  confirmed: "Confirmed on-chain",
  failed: "Failed",
};

const STATUS_TINT: Record<SettlementStatus, string> = {
  pending: "bg-warn/10 text-warn ring-warn/30",
  confirmed: "bg-verify-500/10 text-verify-600 ring-verify-500/20",
  failed: "bg-danger/10 text-danger ring-danger/30",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-xs">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

/**
 * Verifiable on-chain settlement data — contract address, transaction hash,
 * block timestamp, and confirmation status. Shown wherever a settlement is
 * claimed so it can be independently checked on the Monad explorer.
 */
export function SettlementProof({
  txHash,
  blockNumber,
  timestamp,
  status,
}: {
  txHash?: string;
  blockNumber?: number;
  timestamp?: number;
  status: SettlementStatus;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Settlement proof
        </p>
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${STATUS_TINT[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
      <Row label="Settlement contract">
        <a
          href={settlementExplorerAddress()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-brand-500 hover:underline"
        >
          {shortAddr(SETTLEMENT_CONTRACT_ADDRESS)} ↗
        </a>
      </Row>
      <Row label="Transaction hash">
        {txHash && txHash !== "0x0" ? (
          <a
            href={settlementExplorerTx(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-brand-500 hover:underline"
          >
            {shortAddr(txHash, 8, 6)} ↗
          </a>
        ) : (
          <span className="font-mono text-muted">awaiting submission</span>
        )}
      </Row>
      {blockNumber !== undefined && <Row label="Block number">{blockNumber.toLocaleString()}</Row>}
      <Row label="Block timestamp">
        {timestamp ? new Date(timestamp * 1000).toLocaleString() : "—"}
      </Row>
      <Row label="Network">Monad Testnet (chain ID 10143)</Row>
    </div>
  );
}

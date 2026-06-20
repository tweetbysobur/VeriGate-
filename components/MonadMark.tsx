import { monadConfig } from "@/lib/web3/monad";

/**
 * Monad brand mark — official logo with the characteristic "M" design
 * in Monad purple #A78BFA (official brand color).
 */
export function MonadMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Monad official "M" logo */}
      <path
        d="M8 10L16 22L24 10M12 10V18M20 10V18M12 18H20"
        stroke="#A78BFA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Circle frame */}
      <circle cx="16" cy="16" r="14" stroke="#A78BFA" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}

/** Network indicator — reflects the active Monad network (testnet/mainnet). */
export function NetworkBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 ring-1 ring-purple-500/30">
      <MonadMark size={14} />
      {monadConfig().name}
    </span>
  );
}

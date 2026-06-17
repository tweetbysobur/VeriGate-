import { monadConfig } from "@/lib/web3/monad";

/**
 * Monad brand mark — the official rounded diamond with a circular counter
 * ("coin") in Monad purple #836EF9.
 */
export function MonadMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <mask id="monad-counter">
        <rect width="24" height="24" fill="#fff" />
        <circle cx="12" cy="12" r="2.9" fill="#000" />
      </mask>
      <rect
        x="4.8"
        y="4.8"
        width="14.4"
        height="14.4"
        rx="3.6"
        transform="rotate(45 12 12)"
        fill="#836EF9"
        mask="url(#monad-counter)"
      />
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

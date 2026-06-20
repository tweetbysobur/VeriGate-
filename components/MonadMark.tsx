import { monadConfig } from "@/lib/web3/monad";

/**
 * Monad brand mark — purple diamond with circular counter
 * Official color: #A78BFA (Monad purple)
 */
export function MonadMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <mask id="monad-hole">
          <rect width="24" height="24" fill="white" />
          <circle cx="12" cy="12" r="2" fill="black" />
        </mask>
      </defs>
      {/* Rounded diamond shape (rotated square) */}
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="2"
        transform="rotate(45 12 12)"
        fill="#A78BFA"
        mask="url(#monad-hole)"
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

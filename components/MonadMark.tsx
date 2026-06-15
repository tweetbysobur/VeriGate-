/**
 * Monad chain mark — geometric badge in Monad purple (#836EF9).
 * Swap in the official Monad SVG asset here if you have the brand kit.
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
      <circle cx="12" cy="12" r="11" fill="#836EF9" />
      <path
        d="M12 4.6c-2.1 2-3.7 4.6-3.7 7.4S9.9 17.4 12 19.4c2.1-2 3.7-4.6 3.7-7.4S14.1 6.6 12 4.6Z"
        fill="#ffffff"
        fillOpacity="0.92"
      />
    </svg>
  );
}

/** Static "Monad" network indicator (Monad is the only supported chain). */
export function NetworkBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 ring-1 ring-purple-500/30">
      <MonadMark size={14} />
      Monad
    </span>
  );
}

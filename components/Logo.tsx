/** VeriGate wordmark + shield-check mark. */
export function VeriGateMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vg-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="var(--brand-400)" />
          <stop offset="1" stopColor="var(--brand-600)" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 4 7v8.2c0 6.7 4.7 11.6 12 14.3 7.3-2.7 12-7.6 12-14.3V7L16 2.5Z"
        fill="url(#vg-grad)"
      />
      <path
        d="m10.5 16.2 3.6 3.6 7-7.2"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <VeriGateMark size={size} />
      <span className="text-[1.15rem] text-foreground">
        Veri<span className="text-brand-500">Gate</span>
      </span>
    </span>
  );
}

/**
 * VeriGate brandmark.
 * - The mark: a rounded "gate" badge in the brand gradient; the bold check
 *   reads as both a verification tick and the "V" of VeriGate.
 * - The wordmark: "Veri" in the foreground + "Gate" in a brand gradient.
 */
export function VeriGateMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="vg-grad"
          x1="3"
          y1="3"
          x2="33"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7b84fb" />
          <stop offset="1" stopColor="#4a43c4" />
        </linearGradient>
      </defs>
      {/* badge */}
      <rect x="3" y="3" width="30" height="30" rx="8.5" fill="url(#vg-grad)" />
      {/* inner stroke for depth */}
      <rect
        x="3.6"
        y="3.6"
        width="28.8"
        height="28.8"
        rx="7.9"
        stroke="#ffffff"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />
      {/* check = V */}
      <path
        d="M10.5 18.6l4.7 4.7L25.7 12.4"
        stroke="#ffffff"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <VeriGateMark size={size} />
      <span className="text-[1.2rem] leading-none text-foreground">
        Veri
        <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
          Gate
        </span>
      </span>
    </span>
  );
}

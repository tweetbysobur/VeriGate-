/**
 * VeriGate brandmark — "VG" monogram.
 *
 * The checkmark IS the V: a verification tick whose long arm bridges up into
 * the G ring (trust → payment rail → interoperability). The G is an open ring
 * with a tongue; the V/check connects at its upper edge — one continuous,
 * geometric mark. Colors: deep indigo #5B5BF7 → electric purple #7C4DFF.
 */

/** The raw VG + check monogram strokes on a 64×64 grid. `color` = stroke. */
function Monogram({ color, sw = 5.5 }: { color: string; sw?: number; idp?: string }) {
  return (
    <g
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {/* V = checkmark, long arm bridging up into the G */}
      <path d="M13 27 L24 39 L50.65 25.54" />
      {/* G = open ring (mouth on the right) */}
      <path d="M50.65 25.54 A13 13 0 1 0 50.65 40.46" />
      {/* G tongue */}
      <path d="M52 33 L43 33" />
    </g>
  );
}

/**
 * App-icon / badge mark: gradient squircle with the white monogram.
 * Scales cleanly from favicon to billboard.
 */
export function VeriGateMark({ size = 32, idp = "m" }: { size?: number; idp?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id={`vg-badge-${idp}`}
          x1="4"
          y1="2"
          x2="60"
          y2="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B5BF7" />
          <stop offset="1" stopColor="#7C4DFF" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#vg-badge-${idp})`} />
      <Monogram color="#ffffff" idp={`b${idp}`} />
    </svg>
  );
}

/** Monogram-only (no badge) in the brand gradient — for light/dark surfaces. */
export function VeriGateGlyph({ size = 32, idp = "g" }: { size?: number; idp?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id={`vg-glyph-${idp}`}
          x1="8"
          y1="6"
          x2="56"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B5BF7" />
          <stop offset="1" stopColor="#7C4DFF" />
        </linearGradient>
      </defs>
      <Monogram color={`url(#vg-glyph-${idp})`} sw={6} idp={`y${idp}`} />
    </svg>
  );
}

/** Horizontal lockup: VG badge + "VeriGate" wordmark. */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <VeriGateMark size={size} idp="hdr" />
      <span className="text-[1.2rem] leading-none text-foreground">
        Veri
        <span className="bg-gradient-to-r from-[#5B5BF7] to-[#7C4DFF] bg-clip-text text-transparent">
          Gate
        </span>
      </span>
    </span>
  );
}

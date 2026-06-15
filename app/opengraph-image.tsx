import { ImageResponse } from "next/og";

export const alt = "VeriGate — Compliance-first payments on Monad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0b0a1f 0%, #1d1a4d 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #7b84fb, #4a43c4)",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="m5 13 4 4L19 7"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: "40px", fontWeight: 700, color: "#fff" }}>
            Veri<span style={{ color: "#9fa8ff" }}>Gate</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "66px", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            Compliant stablecoin payments,
          </div>
          <div style={{ display: "flex", fontSize: "66px", fontWeight: 700, color: "#9fa8ff", lineHeight: 1.1 }}>
            finally usable.
          </div>
          <div style={{ display: "flex", marginTop: "26px", fontSize: "30px", color: "#c4caff" }}>
            Verified identity · compliant assets · audit-ready proof — on Monad.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "24px", color: "#7b84fb" }}>
          <span>Powered by Cleanverse A-Pass + A-Token</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

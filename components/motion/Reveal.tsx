"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "scale";

const VARIANT_CLASS: Record<Variant, string> = {
  up: "",
  left: "vg-reveal-left",
  right: "vg-reveal-right",
  scale: "vg-reveal-scale",
};

/**
 * Scroll-triggered reveal. Adds `.is-in` once the element enters the viewport,
 * driving the CSS transition in globals.css. Honors prefers-reduced-motion
 * (the CSS there forces the visible state, so content never stays hidden).
 *
 * - `delay` (ms) staggers siblings via the `--vg-delay` custom property.
 * - `as` lets it render any tag (div, li, section, h2…).
 * - Reveals once, then stops observing.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  as?: ElementType;
  once?: boolean;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`vg-reveal ${VARIANT_CLASS[variant]} ${shown ? "is-in" : ""} ${className}`}
      style={delay ? ({ "--vg-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

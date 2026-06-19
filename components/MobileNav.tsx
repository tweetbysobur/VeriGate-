"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Tab {
  id: string;
  label: string;
  href: string;
}

/**
 * Mobile navigation: a hamburger button that opens an accessible slide-out
 * drawer. Hidden at >= sm where the inline desktop nav takes over.
 */
export function MobileNav({
  tabs,
  active,
}: {
  tabs: readonly Tab[];
  active: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // While open: lock scroll, close on Escape, move focus into the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Return focus to the trigger when the drawer closes (skip initial mount).
  useEffect(() => {
    if (!open && wasOpen.current) btnRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={btnRef}
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="grid size-9 place-items-center rounded-lg border border-border text-foreground transition hover:bg-card"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-brand-ink/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <div
            id="mobile-nav-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="vg-rise absolute right-0 top-0 flex h-full w-72 max-w-[90%] flex-col bg-card shadow-2xl ring-1 ring-border"
          >
            <div className="flex items-center justify-between border-b border-border bg-background/50 px-5 py-4">
              <span className="text-sm font-bold text-foreground">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-background hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-0.5 p-4" aria-label="Primary">
              {tabs.map((t) => (
                <Link
                  key={t.id}
                  href={t.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === t.id ? "page" : undefined}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active === t.id
                      ? "bg-brand-500/15 text-brand-600 font-semibold"
                      : "text-foreground hover:bg-background/60"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { WalletButton } from "./WalletButton";

export function SiteHeader({
  active,
  mode = "mock",
}: {
  active: "home" | "dashboard" | "apass" | "transactions" | "institutions";
  mode?: "mock" | "live";
}) {
  const tabs = [
    { id: "home", label: "Overview", href: "/" },
    { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "apass", label: "Get A-Pass", href: "/get-apass" },
    { id: "transactions", label: "Transactions", href: "/transactions" },
    { id: "institutions", label: "Institutions", href: "/institutions" },
  ] as const;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active === t.id
                    ? "bg-brand-500/10 text-brand-600"
                    : "text-muted hover:bg-card hover:text-foreground"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 sm:inline-flex ${
              mode === "live"
                ? "bg-verify-500/10 text-verify-600 ring-verify-500/20"
                : "bg-brand-100 text-brand-600 ring-brand-200"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${mode === "live" ? "bg-verify-500" : "bg-brand-500"}`}
            />
            {mode === "live" ? "Live · sandbox" : "Demo mode"}
          </span>
          <WalletButton />
          <MobileNav tabs={tabs} active={active} />
        </div>
      </div>
    </header>
  );
}

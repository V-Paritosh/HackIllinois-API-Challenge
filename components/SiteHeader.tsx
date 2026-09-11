"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/shifts", label: "Shifts" },
  { to: "/my-signups", label: "My Signups" },
  { to: "/volunteers", label: "Volunteers" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary font-mono text-lg font-bold text-primary-foreground">
            H
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">
              HackIllinois Volunteer
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Ops Board
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`rounded-lg px-3 py-2 text-sm transition-colors hover:text-foreground ${
                pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to))
                  ? "bg-primary px-3.5 font-semibold text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/shifts"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Find a Shift
        </Link>
      </div>
    </header>
  );
}

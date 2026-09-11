"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listShifts } from "@/lib/api";
import { ShiftCard } from "@/components/ShiftCard";

export default function Dashboard() {
  const { data: shifts } = useQuery({ queryKey: ["shifts"], queryFn: listShifts });

  const openShifts = shifts?.filter((s) => !s.isFull) ?? [];
  const spotsLeft = shifts?.reduce((sum, s) => sum + s.remainingSpots, 0) ?? 0;
  const eventDay = shifts?.[0]
    ? new Date(`${shifts[0].date}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-foreground/5 ring-1 ring-border backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative grid gap-8 p-8 lg:grid-cols-[1.4fr_1fr] lg:p-12">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent ring-1 ring-accent/30">
              <span className="size-1.5 rounded-full bg-accent" /> Live roster
            </span>
            <h1 className="mt-5 max-w-[48ch] text-balance text-4xl font-semibold leading-tight lg:text-5xl">
              Grab a shift before the board fills up.
            </h1>
            <p className="mt-4 max-w-[52ch] text-pretty text-base text-muted-foreground">
              Browse open volunteer shifts, claim a spot in seconds, and confirm with just your name
              and email. No logins, no volunteer IDs.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/shifts"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Find a Shift
              </Link>
              <Link
                href="/my-signups"
                className="rounded-xl bg-foreground/5 px-6 py-3 text-sm font-medium ring-1 ring-border backdrop-blur-md"
              >
                My Signups
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
            <div className="rounded-2xl bg-foreground/5 p-4 ring-1 ring-border backdrop-blur-md">
              <div className="font-mono text-3xl font-bold">{openShifts.length}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Open shifts
              </div>
            </div>
            <div className="rounded-2xl bg-foreground/5 p-4 ring-1 ring-border backdrop-blur-md">
              <div className="font-mono text-3xl font-bold text-accent">{spotsLeft}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Spots left
              </div>
            </div>
            <div className="rounded-2xl bg-foreground/5 p-4 ring-1 ring-border backdrop-blur-md">
              <div className="font-mono text-3xl font-bold">{eventDay}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Event day
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Available shifts</h2>
          <Link
            href="/shifts"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent"
          >
            See all
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {shifts
            ? shifts.slice(0, 3).map((shift) => <ShiftCard key={shift.id} shift={shift} />)
            : [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[100px] animate-pulse rounded-2xl bg-foreground/5 ring-1 ring-border"
                />
              ))}
        </div>
      </section>
    </main>
  );
}

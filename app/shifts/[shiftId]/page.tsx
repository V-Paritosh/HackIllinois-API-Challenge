"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate, formatRange, getShift } from "@/lib/api";
import { CapacityBar, StatusBadge } from "@/components/ShiftCard";
import { SignupDialog } from "@/components/SignupDialog";

export default function ShiftDetail({ params }: { params: { shiftId: string } }) {
  const { shiftId } = params;
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: shift,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shift", shiftId],
    queryFn: () => getShift(shiftId),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["shift", shiftId] });
    void queryClient.invalidateQueries({ queryKey: ["shifts"] });
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl bg-foreground/5 ring-1 ring-border" />
      </main>
    );
  }

  if (isError || !shift) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">We couldn't find that shift.</h1>
        <Link
          href="/shifts"
          className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to Shifts
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/shifts"
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        ← Back to shifts
      </Link>

      <div className="mt-4 rounded-3xl bg-foreground/[0.06] p-6 ring-1 ring-border backdrop-blur-2xl sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={shift.status} />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {shift.remainingSpots} spots remaining
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Shift detail
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold">{shift.title}</h1>
        <p className="mt-3 text-pretty text-sm text-muted-foreground">{shift.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-foreground/10 ring-1 ring-border">
          <div className="bg-surface/60 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Location
            </dt>
            <dd className="mt-1 text-sm font-medium">{shift.location}</dd>
          </div>
          <div className="bg-surface/60 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Date
            </dt>
            <dd className="mt-1 text-sm font-medium">{formatDate(shift.date)}</dd>
          </div>
          <div className="bg-surface/60 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Time
            </dt>
            <dd className="mt-1 font-mono text-sm">
              {formatRange(shift.startTime, shift.endTime)}
            </dd>
          </div>
          <div className="bg-surface/60 p-3">
            <dt className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Capacity
            </dt>
            <dd className="mt-1 font-mono text-sm">{shift.capacity} volunteers</dd>
          </div>
        </dl>

        <div className="mt-6">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>Volunteers</span>
            <span>
              {shift.volunteerCount} / {shift.capacity}
            </span>
          </div>
          <CapacityBar shift={shift} className="mt-2 h-2" />
        </div>

        {shift.isFull ? (
          <>
            <button
              disabled
              className="mt-7 w-full cursor-not-allowed rounded-xl bg-foreground/5 py-3.5 text-sm font-semibold text-muted-foreground ring-1 ring-border"
            >
              This shift is full
            </button>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-full">
              0 spots remaining · choose another shift
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-7 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Sign Up for This Shift
            </button>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {shift.remainingSpots} spots remaining · no account needed
            </p>
          </>
        )}
      </div>

      {dialogOpen && (
        <SignupDialog shift={shift} onClose={() => setDialogOpen(false)} onSuccess={refresh} />
      )}
    </main>
  );
}

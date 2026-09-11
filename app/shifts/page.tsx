"use client";
import { useQuery } from "@tanstack/react-query";
import { listShifts } from "@/lib/api";
import { ShiftCard } from "@/components/ShiftCard";

export default function ShiftsPage() {
  const { data: shifts, isLoading } = useQuery({ queryKey: ["shifts"], queryFn: listShifts });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            Step 1 · Pick a shift
          </span>
          <h1 className="mt-2 text-3xl font-semibold">Available shifts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open a shift to see the details and sign yourself up. No account required.
          </p>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
          Updated live
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading
          ? [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[100px] animate-pulse rounded-2xl bg-foreground/5 ring-1 ring-border"
              />
            ))
          : shifts?.map((shift) => <ShiftCard key={shift.id} shift={shift} />)}
      </div>
    </main>
  );
}

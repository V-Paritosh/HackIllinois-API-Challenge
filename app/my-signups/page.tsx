"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatRange, formatShortDate, getShiftsByEmail, removeSignup } from "@/lib/api";

export default function MySignups() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8" />}>
      <MySignupsContent />
    </Suspense>
  );
}

function MySignupsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const email = searchParams.get("email") ?? undefined;
  const [input, setInput] = useState(email ?? "");
  const [error, setError] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["my-signups", email],
    queryFn: () => getShiftsByEmail(email!),
    enabled: Boolean(email),
  });
  const removeMutation = useMutation({
    mutationFn: ({ shiftId, volunteerId }: { shiftId: string; volunteerId: string }) =>
      removeSignup(shiftId, volunteerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-signups", email] }),
    onError: (mutationError) =>
      setError(mutationError instanceof Error ? mutationError.message : "Unable to remove signup."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    router.push(`/my-signups?email=${encodeURIComponent(value)}`);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
        My signups
      </span>
      <h1 className="mt-2 text-3xl font-semibold">Find your signups</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the email you signed up with to see your shifts.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 flex flex-col gap-3 rounded-2xl bg-foreground/5 p-5 ring-1 ring-border backdrop-blur-xl sm:flex-row sm:items-end"
      >
        <label className="flex-1">
          <span className="text-xs font-medium text-muted-foreground">Email</span>
          <input
            type="email"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="jane@example.com"
            className="mt-1.5 w-full rounded-lg bg-background/50 px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          View My Shifts
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-full">{error}</p>}

      {email && (
        <section className="mt-8">
          {isFetching ? (
            <div className="h-24 animate-pulse rounded-2xl bg-foreground/5 ring-1 ring-border" />
          ) : !data ? (
            <div className="rounded-2xl bg-foreground/5 p-6 text-center ring-1 ring-border">
              <p className="text-sm text-muted-foreground">
                No signups found for <span className="font-mono">{email}</span>.
              </p>
              <Link
                href="/shifts"
                className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Find a Shift
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Your upcoming shifts</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {data.volunteer.name} · {data.volunteer.email}
              </p>
              {data.shifts.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  You haven't signed up for a shift yet.
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {data.shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-center gap-4 rounded-2xl bg-foreground/5 p-4 ring-1 ring-border backdrop-blur-xl"
                    >
                      <Link href={`/shifts/${shift.id}`} className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{shift.title}</div>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {formatShortDate(shift.date)} {"·"}
                          {formatRange(shift.startTime, shift.endTime)}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {shift.location}
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remove your signup for ${shift.title}?`)) {
                            setError(null);
                            removeMutation.mutate({
                              shiftId: shift.id,
                              volunteerId: data.volunteer.id,
                            });
                          }
                        }}
                        disabled={removeMutation.isPending}
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-full ring-1 ring-full/30 transition-colors hover:bg-full/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}

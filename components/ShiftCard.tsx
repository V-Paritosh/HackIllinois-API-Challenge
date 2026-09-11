import Link from "next/link";
import { dayLabel, formatRange, monthLabel, type ShiftWithCapacity } from "@/lib/api";

export function StatusBadge({ status }: { status: ShiftWithCapacity["status"] }) {
  const map = {
    open: { label: "Open", cls: "bg-open/15 text-open" },
    "almost-full": { label: "Almost full", cls: "bg-warn/15 text-warn" },
    full: { label: "Full", cls: "bg-full/15 text-full" },
  } as const;
  const item = map[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${item.cls}`}
    >
      {item.label}
    </span>
  );
}

export function CapacityBar({
  shift,
  className = "",
}: {
  shift: ShiftWithCapacity;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((shift.volunteerCount / shift.capacity) * 100));
  const color =
    shift.status === "full" ? "bg-full" : shift.status === "almost-full" ? "bg-warn" : "bg-open";
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-foreground/10 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ShiftCard({ shift }: { shift: ShiftWithCapacity }) {
  return (
    <Link
      href={`/shifts/${shift.id}`}
      className={`group relative flex items-center gap-4 rounded-2xl p-4 ring-1 ring-border backdrop-blur-xl transition-transform hover:-translate-y-0.5 ${
        shift.isFull ? "bg-foreground/[0.02]" : "bg-foreground/5"
      }`}
    >
      <div className="w-14 shrink-0 rounded-xl bg-foreground/5 pb-2 text-center ring-1 ring-border">
        <div className="pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {monthLabel(shift.date)}
        </div>
        <div
          className={`font-mono text-2xl font-bold ${shift.isFull ? "text-muted-foreground" : ""}`}
        >
          {dayLabel(shift.date)}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`truncate text-sm font-semibold ${shift.isFull ? "text-muted-foreground" : ""}`}
          >
            {shift.title}
          </span>
          <StatusBadge status={shift.status} />
        </div>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
          {formatRange(shift.startTime, shift.endTime)} · {shift.location}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <CapacityBar shift={shift} className="flex-1" />
          <span className="font-mono text-[11px] text-muted-foreground">
            {shift.volunteerCount}/{shift.capacity}
          </span>
        </div>
      </div>

      <span
        className={`hidden rounded-lg px-3 py-1.5 text-xs font-semibold sm:block ${
          shift.isFull
            ? "bg-foreground/5 font-medium text-muted-foreground ring-1 ring-border"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {shift.isFull ? "Full" : "View"}
      </span>
    </Link>
  );
}

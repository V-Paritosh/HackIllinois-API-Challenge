import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  formatDate,
  formatRange,
  selfServiceSignup,
  type ShiftWithCapacity,
  type Volunteer,
} from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

type Props = {
  shift: ShiftWithCapacity;
  onClose: () => void;
  onSuccess: () => void;
};

export function SignupDialog({ shift, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Volunteer | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = () => {
    const next: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) next.name = "Please enter your name.";
    else if (name.trim().length > 100) next.name = "Name must be under 100 characters.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Please enter a valid email address.";
    if (phone.trim() && !isValidPhone(phone))
      next.phone = "Enter a 10-digit phone number, such as (555) 123-4567.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      const result = await selfServiceSignup(shift.id, {
        name: name.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: normalizePhone(phone) } : {}),
      });
      setConfirmed(result.volunteer);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
        if (err.code === "SHIFT_FULL") onSuccess();
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Sign up for ${shift.title}`}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-foreground/[0.07] ring-1 ring-border backdrop-blur-2xl animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border bg-foreground/5 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {confirmed ? "Signup confirmed" : "You're signing up for"}
          </div>
          <h4 className="mt-2 text-lg font-semibold">{shift.title}</h4>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {shift.location} · {formatDate(shift.date)}
          </div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {formatRange(shift.startTime, shift.endTime)}
          </div>
          {!confirmed && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-open/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-open ring-1 ring-open/30">
              {shift.remainingSpots} spots remaining
            </div>
          )}
        </div>

        {confirmed ? (
          <div className="p-5">
            <div className="grid size-10 place-items-center rounded-full bg-open text-background">
              <svg
                className="size-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 10.5l3.5 3.5L16 5.5" />
              </svg>
            </div>
            <div className="mt-4 text-xl font-semibold">You're signed up.</div>
            <div className="mt-4 rounded-xl bg-background/50 p-4 ring-1 ring-border">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Signed up as
              </div>
              <div className="mt-1 text-sm">{confirmed.name}</div>
              <div className="font-mono text-xs text-muted-foreground">{confirmed.email}</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">We'll see you there.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/shifts"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Back to Shifts
              </Link>
              <Link
                href={`/my-signups?email=${encodeURIComponent(confirmed.email)}`}
                className="rounded-xl px-5 py-3 text-sm font-medium ring-1 ring-border"
              >
                View My Signups
              </Link>
            </div>
          </div>
        ) : (
          <form className="p-5" onSubmit={submit} noValidate>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Your information
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-medium text-muted-foreground">Name</span>
              <input
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1.5 w-full rounded-lg bg-background/50 px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.name && <span className="mt-1 block text-xs text-full">{errors.name}</span>}
            </label>

            <label className="mt-3 block">
              <span className="text-xs font-medium text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="mt-1.5 w-full rounded-lg bg-background/50 px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.email && <span className="mt-1 block text-xs text-full">{errors.email}</span>}
            </label>

            <label className="mt-3 block">
              <span className="text-xs font-medium text-muted-foreground">
                Phone <span className="opacity-60">(optional)</span>
              </span>
              <input
                type="tel"
                value={phone}
                maxLength={30}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="555-123-4567"
                className="mt-1.5 w-full rounded-lg bg-background/50 px-3 py-2.5 text-sm ring-1 ring-border placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.phone && <span className="mt-1 block text-xs text-full">{errors.phone}</span>}
            </label>

            {apiError && (
              <div className="mt-4 rounded-lg bg-full/10 px-3 py-2.5 text-sm text-full ring-1 ring-full/30">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? "Signing you up…" : "Confirm Signup"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-xl py-2 text-xs font-medium text-muted-foreground"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

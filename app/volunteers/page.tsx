"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createVolunteer, listVolunteers } from "@/lib/api";
import { isValidPhone, normalizePhone } from "@/lib/phone";

export default function VolunteersPage() {
  const queryClient = useQueryClient();
  const { data: volunteers, isLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: listVolunteers,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setNote("Enter a name and a valid email.");
      return;
    }
    if (phone.trim() && !isValidPhone(phone)) {
      setNote("Enter a 10-digit phone number, such as (555) 123-4567.");
      return;
    }
    setSaving(true);
    setNote(null);
    await createVolunteer({
      name,
      email,
      ...(phone.trim() ? { phone: normalizePhone(phone) } : {}),
    });
    await queryClient.invalidateQueries({ queryKey: ["volunteers"] });
    setName("");
    setEmail("");
    setPhone("");
    setSaving(false);
    setNote("Volunteer saved.");
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Admin / demo view
      </span>
      <h1 className="mt-2 text-3xl font-semibold">Volunteers</h1>
      <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
        This page is for demonstration only. Volunteers do not need it —{" "}
        <Link href="/shifts" className="text-accent">
          signing up for a shift
        </Link>{" "}
        creates their record automatically.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 grid gap-3 rounded-2xl bg-foreground/5 p-5 ring-1 ring-border backdrop-blur-xl sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      >
        <label>
          <span className="text-xs font-medium text-muted-foreground">Name</span>
          <input
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-background/50 px-3 py-2.5 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label>
          <span className="text-xs font-medium text-muted-foreground">Email</span>
          <input
            type="email"
            value={email}
            maxLength={255}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-background/50 px-3 py-2.5 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label>
          <span className="text-xs font-medium text-muted-foreground">Phone</span>
          <input
            value={phone}
            maxLength={30}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="555-123-4567"
            className="mt-1.5 w-full rounded-lg bg-background/50 px-3 py-2.5 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-foreground/10 px-4 py-2.5 text-sm font-medium ring-1 ring-border disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add"}
        </button>
      </form>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Phone</th>
              <th className="px-4 py-3 text-right font-normal">Shifts</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : (
              volunteers?.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {v.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{v.signupCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

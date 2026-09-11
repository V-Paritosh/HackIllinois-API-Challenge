const configuredApiUrl = process.env["NEXT_PUBLIC_API_URL"];
const API_URL =
  typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "/api"
    : (configuredApiUrl ?? "/api");

export type Shift = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
};
export type Volunteer = { id: string; name: string; email: string; phone?: string };
export type Signup = { id: string; shiftId: string; volunteerId: string; createdAt: string };
export type ShiftWithCapacity = Shift & {
  volunteerCount: number;
  remainingSpots: number;
  isFull: boolean;
  status: "open" | "almost-full" | "full";
};
type ApiShift = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startTimeLocal: string;
  endTimeLocal: string;
  capacity: number;
  signupCount: number;
  remainingSpots: number;
  status: "available" | "nearly_full" | "full";
};

export class ApiError extends Error {
  constructor(
    public readonly code: "ALREADY_SIGNED_UP" | "SHIFT_FULL" | "NOT_FOUND" | "INVALID",
    message: string,
  ) {
    super(message);
  }
}
const displayShift = (value: ApiShift): ShiftWithCapacity => ({
  id: value.id,
  title: value.title,
  description: value.description,
  location: value.location,
  date: value.date,
  startTime: value.startTimeLocal,
  endTime: value.endTimeLocal,
  capacity: value.capacity,
  volunteerCount: value.signupCount,
  remainingSpots: value.remainingSpots,
  isFull: value.status === "full",
  status:
    value.status === "full" ? "full" : value.status === "nearly_full" ? "almost-full" : "open",
});
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await response.json()) as { error?: string; message?: string } & T;
  if (!response.ok) {
    const code =
      body.error === "DuplicateSignup"
        ? "ALREADY_SIGNED_UP"
        : body.error === "ShiftFull"
          ? "SHIFT_FULL"
          : body.error?.includes("NotFound")
            ? "NOT_FOUND"
            : "INVALID";
    throw new ApiError(code, body.message ?? "Something went wrong.");
  }
  return body;
}
export async function listShifts() {
  const values = await request<ApiShift[]>("/shifts?upcoming=false");
  return values.map(displayShift);
}
export async function listVolunteers() {
  return request<(Volunteer & { signupCount: number })[]>("/volunteers");
}
export async function createVolunteer(input: { name: string; email: string; phone?: string }) {
  return request<Volunteer>("/volunteers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export async function getShift(shiftId: string) {
  return displayShift(await request<ApiShift>(`/shifts/${encodeURIComponent(shiftId)}`));
}
export async function selfServiceSignup(
  shiftId: string,
  person: { name: string; email: string; phone?: string },
): Promise<{ volunteer: Volunteer; shift: ShiftWithCapacity }> {
  const result = await request<{ volunteer: Volunteer; shift: ApiShift }>(
    `/shifts/${encodeURIComponent(shiftId)}/signup`,
    { method: "POST", body: JSON.stringify(person) },
  );
  return { volunteer: result.volunteer, shift: displayShift(result.shift) };
}
export async function removeSignup(shiftId: string, volunteerId: string) {
  await request<{ ok: true }>(
    `/shifts/${encodeURIComponent(shiftId)}/signup/${encodeURIComponent(volunteerId)}`,
    { method: "DELETE" },
  );
}
export async function getShiftsByEmail(
  email: string,
): Promise<{ volunteer: Volunteer; shifts: ShiftWithCapacity[] } | null> {
  try {
    const result = await request<{ volunteer: Volunteer; shifts: ApiShift[] }>(
      `/volunteers/by-email/${encodeURIComponent(email.trim().toLowerCase())}/shifts`,
    );
    return { volunteer: result.volunteer, shifts: result.shifts.map(displayShift) };
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") return null;
    throw error;
  }
}
export const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
export const formatShortDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const monthLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short" });
export const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { day: "2-digit" });
export const formatTime = (time: string) => {
  const [hourText, minute = "00"] = time.split(":");
  const hour = Number(hourText ?? 0);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
};
export const formatRange = (start: string, end: string) =>
  `${formatTime(start)} – ${formatTime(end)}`;

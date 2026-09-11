import { z } from "zod";

const email = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());
const phone = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}$/.test(value),
    "Phone number must contain exactly 10 digits.",
  )
  .transform((value) => (value ? value.replace(/\D/g, "") : undefined))
  .optional();

export const selfServiceSignupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email,
  phone,
});
export const createVolunteerSchema = selfServiceSignupSchema;
export const updateVolunteerSchema = selfServiceSignupSchema.partial();
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  upcoming: z.enum(["true", "false"]).optional(),
  title: z.string().trim().optional(),
});

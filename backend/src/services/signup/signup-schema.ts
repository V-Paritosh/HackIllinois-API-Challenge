import { z } from "zod";

const phone = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}$/.test(value),
    "Phone number must contain exactly 10 digits.",
  )
  .transform((value) => (value ? value.replace(/\D/g, "") : undefined))
  .optional();

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  phone,
});

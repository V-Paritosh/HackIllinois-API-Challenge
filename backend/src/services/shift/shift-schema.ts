import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();
const shiftFields = z.object({
  title: z.string().trim().min(1).max(150),
  description: optionalText(2000),
  location: optionalText(200),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  capacity: z.coerce.number().int().positive(),
});

export const createShiftSchema = shiftFields.refine((value) => value.endTime > value.startTime, {
  message: "endTime must be after startTime",
  path: ["endTime"],
});
export const updateShiftSchema = shiftFields
  .partial()
  .refine(
    (value) =>
      value.startTime === undefined ||
      value.endTime === undefined ||
      value.endTime > value.startTime,
    { message: "endTime must be after startTime", path: ["endTime"] },
  );
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  upcoming: z.enum(["true", "false"]).optional(),
  title: z.string().trim().optional(),
});

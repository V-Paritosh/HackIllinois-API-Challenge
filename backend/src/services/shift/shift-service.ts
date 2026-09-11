import mongoose from "mongoose";
import { notFound, AppError } from "../../errors.js";
import { Signup } from "../signup/signup-model.js";
import { Shift } from "./shift-model.js";
import { createShiftSchema, paginationSchema, updateShiftSchema } from "./shift-schema.js";

type ShiftRecord = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: Date;
  endTime: Date;
  capacity: number;
};

const asShift = (value: unknown) => value as ShiftRecord;
const objectId = (value: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, "InvalidId", "The supplied id is invalid.");
  }
  return new mongoose.Types.ObjectId(value);
};
const availability = (count: number, capacity: number) =>
  count >= capacity ? "full" : count / capacity >= 0.75 ? "nearly_full" : "available";

export async function shiftView(document: unknown) {
  const shift = asShift(document);
  const signupCount = await Signup.countDocuments({ shiftId: shift._id });
  return {
    id: shift._id.toString(),
    title: shift.title,
    description: shift.description ?? "",
    location: shift.location ?? "",
    startTime: shift.startTime.toISOString(),
    endTime: shift.endTime.toISOString(),
    capacity: shift.capacity,
    signupCount,
    remainingSpots: Math.max(0, shift.capacity - signupCount),
    status: availability(signupCount, shift.capacity),
    date: shift.startTime.toISOString().slice(0, 10),
    startTimeLocal: shift.startTime.toISOString().slice(11, 16),
    endTimeLocal: shift.endTime.toISOString().slice(11, 16),
  };
}

export async function listShifts(query: Record<string, unknown>) {
  const parsed = paginationSchema.parse(query);
  const filter: Record<string, unknown> = {};
  if (parsed.upcoming === "true") filter.startTime = { $gte: new Date() };
  if (parsed.title) filter.title = { $regex: parsed.title, $options: "i" };
  const shifts = await Shift.find(filter)
    .sort({ startTime: 1 })
    .skip((parsed.page - 1) * parsed.limit)
    .limit(parsed.limit);
  const signupCounts = await Signup.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { shiftId: { $in: shifts.map((shift) => shift._id) } } },
    { $group: { _id: "$shiftId", count: { $sum: 1 } } },
  ]);
  const countsByShiftId = new Map(
    signupCounts.map(({ _id, count }) => [_id.toString(), count]),
  );

  return shifts.map((shift) => {
    const value = asShift(shift);
    const signupCount = countsByShiftId.get(value._id.toString()) ?? 0;
    return {
      id: value._id.toString(),
      title: value.title,
      description: value.description ?? "",
      location: value.location ?? "",
      startTime: value.startTime.toISOString(),
      endTime: value.endTime.toISOString(),
      capacity: value.capacity,
      signupCount,
      remainingSpots: Math.max(0, value.capacity - signupCount),
      status: availability(signupCount, value.capacity),
      date: value.startTime.toISOString().slice(0, 10),
      startTimeLocal: value.startTime.toISOString().slice(11, 16),
      endTimeLocal: value.endTime.toISOString().slice(11, 16),
    };
  });
}

export async function getShift(value: string) {
  const shift = await Shift.findById(objectId(value));
  if (!shift) throw notFound("Shift not found.", "ShiftNotFound");
  return shiftView(shift);
}

export async function createShift(input: unknown) {
  return shiftView(await Shift.create(createShiftSchema.parse(input)));
}

export async function updateShift(value: string, input: unknown) {
  const shift = await Shift.findById(objectId(value));
  if (!shift) throw notFound("Shift not found.", "ShiftNotFound");
  const data = updateShiftSchema.parse(input);
  const current = asShift(shift.toObject());
  const start = data.startTime ?? current.startTime;
  const end = data.endTime ?? current.endTime;
  if (end <= start) throw new AppError(400, "InvalidShiftTime", "endTime must be after startTime.");
  if (
    data.capacity !== undefined &&
    data.capacity < (await Signup.countDocuments({ shiftId: current._id }))
  ) {
    throw new AppError(
      409,
      "InvalidCapacity",
      "Capacity cannot be below the current signup count.",
    );
  }
  Object.assign(shift, data);
  await shift.save();
  return shiftView(shift);
}

export async function deleteShift(value: string) {
  const shift = await Shift.findByIdAndDelete(objectId(value));
  if (!shift) throw notFound("Shift not found.", "ShiftNotFound");
  await Signup.deleteMany({ shiftId: shift._id });
}

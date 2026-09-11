import mongoose from "mongoose";
import { notFound, AppError } from "../../errors.js";
import { Signup } from "../signup/signup-model.js";
import { Volunteer } from "./volunteer-model.js";
import {
  createVolunteerSchema,
  paginationSchema,
  updateVolunteerSchema,
} from "./volunteer-schema.js";

type VolunteerRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string | null;
};

const asVolunteer = (value: unknown) => value as VolunteerRecord;
const objectId = (value: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, "InvalidId", "The supplied id is invalid.");
  }
  return new mongoose.Types.ObjectId(value);
};

export const volunteerView = (value: VolunteerRecord) => ({
  id: value._id.toString(),
  name: value.name,
  email: value.email,
  ...(value.phone ? { phone: value.phone } : {}),
});

export async function listVolunteers(query: Record<string, unknown>) {
  const parsed = paginationSchema.parse(query);
  const values = await Volunteer.find()
    .sort({ createdAt: -1 })
    .skip((parsed.page - 1) * parsed.limit)
    .limit(parsed.limit);
  return Promise.all(
    values.map(async (value) => ({
      ...volunteerView(asVolunteer(value.toObject())),
      signupCount: await Signup.countDocuments({ volunteerId: value._id }),
    })),
  );
}

export async function createVolunteer(input: unknown) {
  return volunteerView(
    asVolunteer((await Volunteer.create(createVolunteerSchema.parse(input))).toObject()),
  );
}

export async function getVolunteer(value: string) {
  const volunteer = await Volunteer.findById(objectId(value));
  if (!volunteer) throw notFound("Volunteer not found.", "VolunteerNotFound");
  return volunteerView(asVolunteer(volunteer.toObject()));
}

export async function updateVolunteer(value: string, input: unknown) {
  const volunteer = await Volunteer.findByIdAndUpdate(
    objectId(value),
    updateVolunteerSchema.parse(input),
    { new: true, runValidators: true },
  );
  if (!volunteer) throw notFound("Volunteer not found.", "VolunteerNotFound");
  return volunteerView(asVolunteer(volunteer.toObject()));
}

export async function deleteVolunteer(value: string) {
  const volunteer = await Volunteer.findByIdAndDelete(objectId(value));
  if (!volunteer) throw notFound("Volunteer not found.", "VolunteerNotFound");
  await Signup.deleteMany({ volunteerId: volunteer._id });
}

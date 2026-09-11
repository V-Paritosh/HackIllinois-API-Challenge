import mongoose from "mongoose";
import { conflict, notFound, AppError } from "../../errors.js";
import { Shift } from "../shift/shift-model.js";
import { shiftView } from "../shift/shift-service.js";
import { Volunteer } from "../volunteer/volunteer-model.js";
import { volunteerView } from "../volunteer/volunteer-service.js";
import { signupSchema } from "./signup-schema.js";
import { Signup } from "./signup-model.js";

type VolunteerRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string | null;
};
type ShiftRecord = { _id: mongoose.Types.ObjectId; capacity: number };
type SignupRecord = { _id: mongoose.Types.ObjectId; createdAt: Date };
const asVolunteer = (value: unknown) => value as VolunteerRecord;
const asShift = (value: unknown) => value as ShiftRecord;
const asSignup = (value: unknown) => value as SignupRecord;
const objectId = (value: string) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new AppError(400, "InvalidId", "The supplied id is invalid.");
  }
  return new mongoose.Types.ObjectId(value);
};

export async function selfServiceSignup(shiftValue: string, input: unknown) {
  const shiftId = objectId(shiftValue);
  const session = await mongoose.startSession();
  let result:
    | {
        signup: SignupRecord;
        volunteer: VolunteerRecord;
        shift: ShiftRecord;
      }
    | undefined;

  try {
    await session.withTransaction(async () => {
      const shift = await Shift.findById(shiftId).session(session);
      if (!shift) throw notFound("Shift not found.", "ShiftNotFound");
      const data = signupSchema.parse(input);

      // A write to the Shift document serializes signup transactions for this shift.
      await Shift.updateOne(
        { _id: shiftId },
        { $inc: { capacity: 1 } },
        { session, timestamps: false },
      );

      const volunteer = await Volunteer.findOneAndUpdate(
        { email: data.email },
        { $setOnInsert: data },
        { new: true, upsert: true, setDefaultsOnInsert: true, session },
      );
      if (!volunteer) {
        throw new AppError(500, "InternalServerError", "Volunteer could not be created.");
      }
      if (await Signup.exists({ volunteerId: volunteer._id, shiftId }).session(session)) {
        throw conflict("DuplicateSignup", "You are already signed up for this shift.");
      }
      if (
        (await Signup.countDocuments({ shiftId }).session(session)) >=
        asShift(shift.toObject()).capacity
      ) {
        throw conflict("ShiftFull", "Sorry, this shift is full.");
      }

      const [signup] = await Signup.create([{ volunteerId: volunteer._id, shiftId }], { session });
      if (!signup) throw new AppError(500, "InternalServerError", "Signup could not be created.");
      await Shift.updateOne(
        { _id: shiftId },
        { $inc: { capacity: -1 } },
        { session, timestamps: false },
      );
      result = {
        signup: asSignup(signup.toObject()),
        volunteer: asVolunteer(volunteer.toObject()),
        shift: asShift(shift.toObject()),
      };
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw conflict("DuplicateSignup", "You are already signed up for this shift.");
    }
    throw error;
  } finally {
    await session.endSession();
  }

  if (!result) throw new AppError(500, "InternalServerError", "Signup could not be created.");
  const shift = await shiftView(result.shift);
  return {
    signup: {
      id: result.signup._id.toString(),
      createdAt: result.signup.createdAt.toISOString(),
    },
    volunteer: volunteerView(result.volunteer),
    shift,
    remainingSpots: shift.remainingSpots,
  };
}

export async function removeSignup(shiftValue: string, volunteerValue: string) {
  const volunteerId = objectId(volunteerValue);
  const result = await Signup.findOneAndDelete({
    shiftId: objectId(shiftValue),
    volunteerId,
  });
  if (!result) throw notFound("Signup not found.", "SignupNotFound");
  if (!(await Signup.exists({ volunteerId }))) {
    await Volunteer.findByIdAndDelete(volunteerId);
  }
}

export async function shiftVolunteers(value: string) {
  const signups = await Signup.find({ shiftId: objectId(value) }).populate("volunteerId");
  return signups.map((signup) => volunteerView(asVolunteer(signup.get("volunteerId"))));
}

export async function volunteerShifts(value: string) {
  const signups = await Signup.find({ volunteerId: objectId(value) });
  const shifts = await Promise.all(signups.map((signup) => Shift.findById(signup.get("shiftId"))));
  return Promise.all(shifts.filter((shift) => shift !== null).map((shift) => shiftView(shift)));
}

export async function shiftsByEmail(email: string) {
  const volunteer = await Volunteer.findOne({ email: email.trim().toLowerCase() });
  if (!volunteer) {
    throw notFound("No volunteer was found for that email.", "VolunteerNotFound");
  }
  return {
    volunteer: volunteerView(asVolunteer(volunteer.toObject())),
    shifts: await volunteerShifts(volunteer._id.toString()),
  };
}

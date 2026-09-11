import mongoose from "mongoose";

const signupSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
signupSchema.index({ volunteerId: 1, shiftId: 1 }, { unique: true });
signupSchema.index({ shiftId: 1 });

export const Signup = mongoose.model("Signup", signupSchema);

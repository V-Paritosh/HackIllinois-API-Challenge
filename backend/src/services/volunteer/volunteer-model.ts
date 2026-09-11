import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    phone: { type: String, trim: true, maxlength: 30 },
  },
  { timestamps: true },
);

export const Volunteer = mongoose.model("Volunteer", volunteerSchema);

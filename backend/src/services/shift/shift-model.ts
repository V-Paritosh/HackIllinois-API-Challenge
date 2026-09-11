import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    location: { type: String, trim: true, maxlength: 200 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export const Shift = mongoose.model("Shift", shiftSchema);

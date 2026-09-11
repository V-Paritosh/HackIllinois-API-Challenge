import "dotenv/config";
import mongoose from "mongoose";
import { Shift } from "./services/shift/shift-model.js";
import { Signup } from "./services/signup/signup-model.js";
import { Volunteer } from "./services/volunteer/volunteer-model.js";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required.");
await mongoose.connect(uri);
await Promise.all([Shift.deleteMany({}), Volunteer.deleteMany({}), Signup.deleteMany({})]);
const volunteers = await Volunteer.insertMany(
  [
    "Ana Ruiz",
    "Devon Park",
    "Priya Nair",
    "Marcus Webb",
    "Lena Osei",
    "Tomas Alvarez",
    "Rin Sato",
    "Chloe Bennett",
    "Idris Khan",
    "Nora Fields",
  ].map((name, index) => ({
    name,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
    ...(index % 3 === 0 ? { phone: "555-010-" + String(index).padStart(4, "0") } : {}),
  })),
);
const shifts = await Shift.insertMany([
  {
    title: "Registration Desk",
    description: "Welcome teams and hand out badges.",
    location: "Siebel Center",
    startTime: "2026-10-03T09:00:00Z",
    endTime: "2026-10-03T11:00:00Z",
    capacity: 10,
  },
  {
    title: "Technical Support",
    description: "Help teams solve hardware and Wi-Fi issues.",
    location: "Siebel Center",
    startTime: "2026-10-03T13:00:00Z",
    endTime: "2026-10-03T15:00:00Z",
    capacity: 10,
  },
  {
    title: "Workshop Support",
    location: "Room 1404",
    startTime: "2026-10-04T10:00:00Z",
    endTime: "2026-10-04T12:00:00Z",
    capacity: 10,
  },
  {
    title: "Demo Floor Guide",
    location: "Main Hall",
    startTime: "2026-10-04T14:00:00Z",
    endTime: "2026-10-04T16:00:00Z",
    capacity: 6,
  },
]);
await Signup.insertMany([
  ...volunteers
    .slice(0, 7)
    .map((volunteer) => ({ volunteerId: volunteer._id, shiftId: shifts[0]!._id })),
  ...volunteers
    .slice(0, 9)
    .map((volunteer) => ({ volunteerId: volunteer._id, shiftId: shifts[1]!._id })),
  ...volunteers.map((volunteer) => ({ volunteerId: volunteer._id, shiftId: shifts[2]!._id })),
  { volunteerId: volunteers[0]!._id, shiftId: shifts[3]!._id },
]);
console.log("Seeded volunteers, shifts, and signups.");
await mongoose.disconnect();

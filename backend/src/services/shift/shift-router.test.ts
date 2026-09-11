import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { Shift } from "./shift-model.js";
import { Signup } from "../signup/signup-model.js";
import { setupTestDatabase } from "../../tests/test-db.js";

setupTestDatabase();

describe("shift routes", () => {
  const shift = {
    title: "Morning Check-in",
    description: "Welcome volunteers.",
    location: "Siebel Center",
    startTime: "2099-01-01T09:00:00.000Z",
    endTime: "2099-01-01T11:00:00.000Z",
    capacity: 4,
  };

  it("creates a shift and returns its computed view", async () => {
    const response = await request(app).post("/api/shifts/").send(shift).expect(201);

    expect(response.body).toMatchObject({
      title: shift.title,
      description: shift.description,
      location: shift.location,
      capacity: shift.capacity,
      signupCount: 0,
      remainingSpots: 4,
      status: "available",
      date: "2099-01-01",
      startTimeLocal: "09:00",
      endTimeLocal: "11:00",
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(await Shift.countDocuments()).toBe(1);
  });

  it("lists shifts with title filtering and pagination", async () => {
    await Shift.create([
      shift,
      { ...shift, title: "Evening Cleanup", startTime: "2099-01-02T18:00:00.000Z" },
    ]);

    const response = await request(app).get("/api/shifts?title=morning&page=1&limit=1").expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ title: "Morning Check-in" });
  });

  it("rejects invalid times and malformed ids", async () => {
    await request(app)
      .post("/api/shifts/")
      .send({ ...shift, endTime: shift.startTime })
      .expect(400)
      .expect(({ body }) => expect(body.error).toBe("ValidationError"));

    await request(app)
      .get("/api/shifts/not-an-id")
      .expect(400)
      .expect(({ body }) => expect(body.error).toBe("InvalidId"));
  });

  it("prevents capacity from dropping below current signups and cascades deletes", async () => {
    const created = await Shift.create(shift);
    await Signup.create([
      { shiftId: created._id, volunteerId: new mongoose.Types.ObjectId() },
      { shiftId: created._id, volunteerId: new mongoose.Types.ObjectId() },
    ]);

    await request(app)
      .patch(`/api/shifts/${created.id}`)
      .send({ capacity: 0 })
      .expect(400);

    await request(app)
      .patch(`/api/shifts/${created.id}`)
      .send({ capacity: 1 })
      .expect(409)
      .expect(({ body }) => expect(body.error).toBe("InvalidCapacity"));

    await request(app).delete(`/api/shifts/${created.id}`).expect(200);
    expect(await Shift.findById(created.id)).toBeNull();
    expect(await Signup.countDocuments({ shiftId: created._id })).toBe(0);
  });

  it("returns not found for a missing shift", async () => {
    const id = new mongoose.Types.ObjectId().toString();
    await request(app)
      .get(`/api/shifts/${id}`)
      .expect(404)
      .expect(({ body }) => expect(body).toMatchObject({ error: "ShiftNotFound" }));
  });
});

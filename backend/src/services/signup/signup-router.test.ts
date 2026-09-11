import { describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { Shift } from "../shift/shift-model.js";
import { Signup } from "./signup-model.js";
import { Volunteer } from "../volunteer/volunteer-model.js";
import { setupTestDatabase } from "../../tests/test-db.js";

setupTestDatabase();

describe("signup routes", () => {
  const shift = {
    title: "Registration Desk",
    startTime: "2099-01-01T09:00:00.000Z",
    endTime: "2099-01-01T11:00:00.000Z",
    capacity: 1,
  };
  const volunteer = { name: "Grace Hopper", email: "grace@example.com", phone: "2175550100" };

  it("creates a signup and reuses the normalized volunteer", async () => {
    const createdShift = await Shift.create(shift);

    const response = await request(app)
      .post(`/api/shifts/${createdShift.id}/signup`)
      .send({ ...volunteer, email: " GRACE@EXAMPLE.COM " })
      .expect(201);

    expect(response.body).toMatchObject({
      volunteer: { name: volunteer.name, email: volunteer.email, phone: volunteer.phone },
      shift: { id: createdShift.id, signupCount: 1, remainingSpots: 0, status: "full" },
      remainingSpots: 0,
    });
    expect(response.body.signup.id).toEqual(expect.any(String));
    expect(await Volunteer.countDocuments()).toBe(1);
    expect(await Signup.countDocuments()).toBe(1);
  });

  it("rejects duplicate and full signups", async () => {
    const createdShift = await Shift.create(shift);
    await request(app).post(`/api/shifts/${createdShift.id}/signup`).send(volunteer).expect(201);

    await request(app)
      .post(`/api/shifts/${createdShift.id}/signup`)
      .send(volunteer)
      .expect(409)
      .expect(({ body }) => expect(body.error).toBe("DuplicateSignup"));

    const otherShift = await Shift.create({ ...shift, title: "Overflow Desk" });
    await request(app).post(`/api/shifts/${otherShift.id}/signup`).send(volunteer).expect(201);
    await request(app)
      .post(`/api/shifts/${otherShift.id}/signup`)
      .send({ ...volunteer, email: "other@example.com", name: "Other Volunteer" })
      .expect(409)
      .expect(({ body }) => expect(body.error).toBe("ShiftFull"));
    expect(await Volunteer.findOne({ email: "other@example.com" })).toBeNull();
  });

  it("allows only one concurrent signup for the final spot", async () => {
    const createdShift = await Shift.create(shift);
    const responses = await Promise.all([
      request(app).post(`/api/shifts/${createdShift.id}/signup`).send(volunteer),
      request(app)
        .post(`/api/shifts/${createdShift.id}/signup`)
        .send({ ...volunteer, email: "another@example.com", name: "Another Volunteer" }),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await Signup.countDocuments({ shiftId: createdShift._id })).toBe(1);
    expect((await request(app).get(`/api/shifts/${createdShift.id}`)).body.remainingSpots).toBe(0);
  });

  it("rolls back a newly-created volunteer when signup creation fails", async () => {
    const createdShift = await Shift.create(shift);
    const createSignup = jest
      .spyOn(Signup, "create")
      .mockRejectedValueOnce(new Error("signup write failed"));

    try {
      await request(app)
        .post(`/api/shifts/${createdShift.id}/signup`)
        .send({ ...volunteer, email: "rollback@example.com" })
        .expect(500);
    } finally {
      createSignup.mockRestore();
    }

    expect(await Volunteer.findOne({ email: "rollback@example.com" })).toBeNull();
    expect(await Signup.countDocuments({ shiftId: createdShift._id })).toBe(0);
  });

  it("lists volunteers and shifts through all lookup routes", async () => {
    const createdShift = await Shift.create(shift);
    const response = await request(app)
      .post(`/api/shifts/${createdShift.id}/signup`)
      .send(volunteer)
      .expect(201);
    const volunteerId = response.body.volunteer.id as string;

    await request(app)
      .get(`/api/shifts/${createdShift.id}/volunteers`)
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual([expect.objectContaining({ email: volunteer.email })]),
      );

    await request(app)
      .get(`/api/volunteers/${volunteerId}/shifts`)
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual([expect.objectContaining({ id: createdShift.id })]),
      );

    await request(app)
      .get(`/api/volunteers/by-email/${encodeURIComponent("GRACE@EXAMPLE.COM")}/shifts`)
      .expect(200)
      .expect(({ body }) =>
        expect(body).toMatchObject({
          volunteer: { email: volunteer.email },
          shifts: [{ id: createdShift.id }],
        }),
      );
  });

  it("removes a signup and orphaned volunteers", async () => {
    const createdShift = await Shift.create(shift);
    const signup = await request(app)
      .post(`/api/shifts/${createdShift.id}/signup`)
      .send(volunteer)
      .expect(201);
    const volunteerId = signup.body.volunteer.id as string;

    await request(app).delete(`/api/shifts/${createdShift.id}/signup/${volunteerId}`).expect(200);
    expect(await Signup.countDocuments()).toBe(0);
    expect(await Volunteer.findById(volunteerId)).toBeNull();

    await request(app)
      .delete(`/api/shifts/${createdShift.id}/signup/${new mongoose.Types.ObjectId()}`)
      .expect(404)
      .expect(({ body }) => expect(body.error).toBe("SignupNotFound"));
  });
});

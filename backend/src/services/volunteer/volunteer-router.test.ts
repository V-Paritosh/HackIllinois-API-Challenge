import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { Volunteer } from "./volunteer-model.js";
import { Signup } from "../signup/signup-model.js";
import { setupTestDatabase } from "../../tests/test-db.js";

setupTestDatabase();

describe("volunteer routes", () => {
  const volunteer = {
    name: "Ada Lovelace",
    email: " ADA@EXAMPLE.COM ",
    phone: "(217) 555-0123",
  };

  it("creates a normalized volunteer", async () => {
    const response = await request(app).post("/api/volunteers/").send(volunteer).expect(201);

    expect(response.body).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "2175550123",
    });
    expect(response.body.id).toEqual(expect.any(String));
  });

  it("lists volunteers with signup counts", async () => {
    const created = await Volunteer.create({ name: "Ada Lovelace", email: "ada@example.com" });
    await Signup.create({ volunteerId: created._id, shiftId: new mongoose.Types.ObjectId() });

    const response = await request(app).get("/api/volunteers/").expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ id: created.id, name: "Ada Lovelace", email: "ada@example.com", signupCount: 1 }),
    ]);
  });

  it("updates a volunteer and validates input", async () => {
    const created = await Volunteer.create({ name: "Ada Lovelace", email: "ada@example.com" });

    const response = await request(app)
      .patch(`/api/volunteers/${created.id}`)
      .send({ name: "Ada Byron", phone: "217-555-0199" })
      .expect(200);

    expect(response.body).toMatchObject({ name: "Ada Byron", phone: "2175550199" });
    await request(app).patch(`/api/volunteers/${created.id}`).send({ phone: "123" }).expect(400);
  });

  it("returns not found for a missing volunteer and deletes signup records", async () => {
    const id = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/api/volunteers/${id}`)
      .expect(404)
      .expect(({ body }) => expect(body.error).toBe("VolunteerNotFound"));

    const created = await Volunteer.create({ name: "Ada Lovelace", email: "ada@example.com" });
    await Signup.create({ volunteerId: created._id, shiftId: new mongoose.Types.ObjectId() });
    await request(app).delete(`/api/volunteers/${created.id}`).expect(200);
    expect(await Volunteer.findById(created.id)).toBeNull();
    expect(await Signup.countDocuments({ volunteerId: created._id })).toBe(0);
  });
});

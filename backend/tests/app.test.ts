import request from "supertest";
import app from "../src/app.js";

describe("API boundary", () => {
  it("reports health without requiring a database query", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("returns structured errors for unknown routes", async () => {
    const response = await request(app).get("/api/not-a-route");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "NotFound", message: "Route not found." });
  });

  it("rejects malformed ids without crashing", async () => {
    const response = await request(app).get("/api/shifts/not-an-object-id");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("InvalidId");
  });
});

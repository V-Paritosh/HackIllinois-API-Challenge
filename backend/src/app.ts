import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { AppError, errorHandler } from "./errors.js";
import shiftRouter from "./services/shift/shift-router.js";
import signupRouter from "./services/signup/signup-router.js";
import volunteerRouter from "./services/volunteer/volunteer-router.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("dev"));
app.get("/api/health", (_request, response) => response.json({ ok: true }));
app.use("/api/shifts", shiftRouter);
app.use("/api/volunteers", volunteerRouter);
app.use("/api", signupRouter);
const openApiDocument = {
  openapi: "3.0.3",
  info: { title: "HackIllinois Volunteer API", version: "1.0.0" },
  paths: {
    "/health": { get: { responses: { "200": { description: "Healthy" } } } },
    "/shifts/{shiftId}/signup": {
      post: {
        summary: "Self-service signup",
        responses: {
          "201": { description: "Signup created" },
          "409": { description: "Duplicate or full shift" },
        },
      },
    },
  },
};
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use((_request, _response, next) => next(new AppError(404, "NotFound", "Route not found.")));
app.use(errorHandler);
export default app;

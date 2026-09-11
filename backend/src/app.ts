import cors from "cors";
import express from "express";
import morgan from "morgan";
import { AppError, errorHandler } from "./errors.js";
import shiftRouter from "./services/shift/shift-router.js";
import signupRouter from "./services/signup/signup-router.js";
import volunteerRouter from "./services/volunteer/volunteer-router.js";
import { swaggerHtml } from "./swagger.js";

const app = express();
if (process.env.FRONTEND_URL) {
  app.use(cors({ origin: process.env.FRONTEND_URL }));
}
app.use(express.json());
app.use(morgan("dev"));
app.get("/api/health", (_request, response) => response.json({ ok: true }));
app.use("/api/shifts", shiftRouter);
app.use("/api/volunteers", volunteerRouter);
app.use("/api", signupRouter);
app.get(["/api/docs", "/api/docs/"], (_request, response) =>
  response.type("html").send(swaggerHtml),
);
app.use((_request, _response, next) => next(new AppError(404, "NotFound", "Route not found.")));
app.use(errorHandler);
export default app;

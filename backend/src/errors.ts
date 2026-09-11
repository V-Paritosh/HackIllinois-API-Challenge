import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
export const notFound = (message: string, code = "NotFound") => new AppError(404, code, message);
export const conflict = (code: string, message: string) => new AppError(409, code, message);
export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "ValidationError",
      message: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
    });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: "ValidationError", message: error.message });
    return;
  }
  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: "InvalidId", message: "The supplied id is invalid." });
    return;
  }
  if (error?.code === 11000) {
    response
      .status(409)
      .json({ error: "Conflict", message: "A record with those details already exists." });
    return;
  }
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.code, message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ error: "InternalServerError", message: "Something went wrong." });
};

import express from "express";
import { asyncHandler, AppError } from "../../errors.js";
import * as service from "./signup-service.js";

const router = express.Router();
const body = (request: express.Request) => request.body as unknown;
const parameter = (request: express.Request, name: string) => {
  const value = request.params[name];
  if (typeof value !== "string") throw new AppError(400, "InvalidParameter", `Invalid ${name}.`);
  return value;
};
const send = (handler: (request: express.Request) => Promise<unknown>, status = 200) =>
  asyncHandler(async (request, response) => response.status(status).json(await handler(request)));

router.post(
  "/shifts/:shiftId/signup",
  send((request) => service.selfServiceSignup(parameter(request, "shiftId"), body(request)), 201),
);
router.delete(
  "/shifts/:shiftId/signup/:volunteerId",
  send(async (request) => {
    await service.removeSignup(parameter(request, "shiftId"), parameter(request, "volunteerId"));
    return { ok: true };
  }),
);
router.get(
  "/shifts/:shiftId/volunteers",
  send((request) => service.shiftVolunteers(parameter(request, "shiftId"))),
);
router.get(
  "/volunteers/by-email/:email/shifts",
  send((request) => service.shiftsByEmail(parameter(request, "email"))),
);
router.get(
  "/volunteers/:volunteerId/shifts",
  send((request) => service.volunteerShifts(parameter(request, "volunteerId"))),
);

export default router;

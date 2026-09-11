import express from "express";
import { asyncHandler, AppError } from "../../errors.js";
import * as service from "./volunteer-service.js";

const router = express.Router();
const body = (request: express.Request) => request.body as unknown;
const parameter = (request: express.Request, name: string) => {
  const value = request.params[name];
  if (typeof value !== "string") throw new AppError(400, "InvalidParameter", `Invalid ${name}.`);
  return value;
};
const send = (handler: (request: express.Request) => Promise<unknown>, status = 200) =>
  asyncHandler(async (request, response) => response.status(status).json(await handler(request)));

router.get(
  "/",
  send((request) => service.listVolunteers(request.query as Record<string, unknown>)),
);
router.post(
  "/",
  send((request) => service.createVolunteer(body(request)), 201),
);
router.get(
  "/:volunteerId",
  send((request) => service.getVolunteer(parameter(request, "volunteerId"))),
);
router.patch(
  "/:volunteerId",
  send((request) => service.updateVolunteer(parameter(request, "volunteerId"), body(request))),
);
router.delete(
  "/:volunteerId",
  send(async (request) => {
    await service.deleteVolunteer(parameter(request, "volunteerId"));
    return { ok: true };
  }),
);

export default router;

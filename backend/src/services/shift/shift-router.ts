import express from "express";
import { asyncHandler, AppError } from "../../errors.js";
import * as service from "./shift-service.js";

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
  send((request) => service.listShifts(request.query as Record<string, unknown>)),
);
router.post(
  "/",
  send((request) => service.createShift(body(request)), 201),
);
router.get(
  "/:shiftId",
  send((request) => service.getShift(parameter(request, "shiftId"))),
);
router.patch(
  "/:shiftId",
  send((request) => service.updateShift(parameter(request, "shiftId"), body(request))),
);
router.delete(
  "/:shiftId",
  send(async (request) => {
    await service.deleteShift(parameter(request, "shiftId"));
    return { ok: true };
  }),
);
export default router;

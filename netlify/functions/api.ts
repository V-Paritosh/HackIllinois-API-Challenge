import serverless from "serverless-http";
import app from "../../backend/src/app.js";
import { connectDatabase } from "../../backend/src/database.js";

const expressHandler = serverless(app);

const normalizeEventBody = (event: Parameters<typeof expressHandler>[0]) => {
  if (!event.body || !event.isBase64Encoded) return event;
  return {
    ...event,
    body: Buffer.from(event.body, "base64").toString("utf8"),
    isBase64Encoded: false,
  };
};

export const handler = async (
  event: Parameters<typeof expressHandler>[0],
  context: Parameters<typeof expressHandler>[1],
) => {
  await connectDatabase();
  return expressHandler(normalizeEventBody(event), context);
};

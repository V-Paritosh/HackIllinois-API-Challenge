import serverless from "serverless-http";
import app from "../../backend/src/app.js";
import { connectDatabase } from "../../backend/src/database.js";

const expressHandler = serverless(app);

const normalizeEventBody = (event: Parameters<typeof expressHandler>[0]) => {
  if (!event.body) return event;
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : typeof event.body === "string"
      ? event.body
      : JSON.stringify(event.body);
  return {
    ...event,
    body,
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

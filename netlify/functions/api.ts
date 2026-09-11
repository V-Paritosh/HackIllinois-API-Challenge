import serverless from "serverless-http";
import app from "../../backend/src/app.js";
import { connectDatabase } from "../../backend/src/database.js";

const expressHandler = serverless(app);
type NetlifyEvent = Parameters<typeof expressHandler>[0] & {
  body?: unknown;
  isBase64Encoded?: boolean | string;
};

const normalizeEventBody = (event: NetlifyEvent) => {
  if (!event.body) return event;
  const isBase64Encoded =
    event.isBase64Encoded === true || (event.isBase64Encoded as unknown) === "true";
  const body = isBase64Encoded
    ? Buffer.from(String(event.body), "base64").toString("utf8")
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
  event: NetlifyEvent,
  context: Parameters<typeof expressHandler>[1],
) => {
  await connectDatabase();
  return expressHandler(normalizeEventBody(event), context);
};

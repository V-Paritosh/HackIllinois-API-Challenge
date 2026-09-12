import serverless from "serverless-http";
import app from "../../backend/src/app.js";
import { connectDatabase } from "../../backend/src/database.js";

const expressHandler = serverless(app);
type LegacyNetlifyEvent = Parameters<typeof expressHandler>[0] & {
  body?: unknown;
  isBase64Encoded?: boolean | string;
};
type NetlifyEvent = LegacyNetlifyEvent | Request;

const isRequest = (event: NetlifyEvent): event is Request =>
  typeof Request !== "undefined" && event instanceof Request;

const normalizeEventBody = async (event: NetlifyEvent): Promise<LegacyNetlifyEvent> => {
  if (isRequest(event)) {
    const url = new URL(event.url);
    return {
      httpMethod: event.method,
      path: url.pathname,
      headers: Object.fromEntries(event.headers.entries()),
      queryStringParameters: Object.fromEntries(url.searchParams.entries()),
      body: await event.text(),
      isBase64Encoded: false,
      requestContext: { identity: { sourceIp: "127.0.0.1" } },
    } as LegacyNetlifyEvent;
  }
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
  return expressHandler(await normalizeEventBody(event), context);
};

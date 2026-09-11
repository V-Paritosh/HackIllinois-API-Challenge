import serverless from "serverless-http";
import app from "../../backend/src/app.js";
import { connectDatabase } from "../../backend/src/database.js";

const expressHandler = serverless(app);

export const handler = async (
  event: Parameters<typeof expressHandler>[0],
  context: Parameters<typeof expressHandler>[1],
) => {
  await connectDatabase();
  return expressHandler(event, context);
};

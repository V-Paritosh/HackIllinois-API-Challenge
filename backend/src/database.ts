import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | undefined;

export function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required.");

  connectionPromise = mongoose.connect(uri).catch((error: unknown) => {
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}

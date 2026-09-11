import { afterAll, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongo: MongoMemoryReplSet;

export function setupTestDatabase(): void {
  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(mongo.getUri());
  }, 30_000);

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  }, 30_000);
}

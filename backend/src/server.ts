import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required.");
await mongoose.connect(uri);
app.listen(port, () => console.log(`Volunteer API listening on http://localhost:${port}`));

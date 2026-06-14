import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  if (!env.MONGODB_URI) {
    console.warn("NxtBiz API started without MONGODB_URI.");
    return null;
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.MONGODB_URI);

  console.log(`NxtBiz MongoDB connected: ${connection.connection.name}`);

  return connection;
};
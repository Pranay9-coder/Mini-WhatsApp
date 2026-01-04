import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected");
};

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL ||
      "mongodb://localhost:27017/ecommerce";

    if (!process.env.MONGO_URI && !process.env.MONGODB_URI && !process.env.DATABASE_URL) {
      console.warn("WARNING: Neither MONGO_URI nor MONGODB_URI found in process.env! Falling back to localhost.");
    }

    const masked = uri.replace(/:([^:@]+)@/, ":****@");
    console.log("Attempting to connect to MongoDB:", masked);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }
};

export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
    const masked = uri.replace(/:([^:@]+)@/, ":****@");
    console.log("Attempting to connect to MongoDB:", masked);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }
};

export default connectDB;

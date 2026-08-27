import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB Database Connected Successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
    });

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ MONGODB_URI is missing in backend/.env!");
      return;
    }

    await mongoose.connect(uri);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

export default connectDB;
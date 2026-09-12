import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import userModel from "../models/userModel.js";

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ MONGODB_URI not found in environment variables.");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB Atlas");

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@cartivo.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "cartivo@admin123";

    console.log(`🔍 Checking admin user account: ${adminEmail}`);

    let admin = await userModel.findOne({ email: adminEmail }).select("+password");

    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(adminPassword, salt);

    if (!admin) {
      admin = await userModel.create({
        name: "Cartivo Administrator",
        email: adminEmail,
        password: hashPassword,
        role: "admin",
        isActive: true,
        phone: "+91 98765 00001",
      });
      console.log(`🎉 SUCCESS: Admin account created!`);
    } else {
      admin.role = "admin";
      admin.isActive = true;
      admin.password = hashPassword;
      admin.lockedUntil = null;
      admin.loginAttempts = 0;
      await admin.save();
      console.log(`🎉 SUCCESS: Admin account updated and password synchronized!`);
    }

    console.log("\n============================================");
    console.log("🔑 ADMIN CREDENTIALS");
    console.log("============================================");
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`ID:       ${admin._id}`);
    console.log("============================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Admin Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();

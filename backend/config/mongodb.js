import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";

const ensureAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@cartivo.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "cartivo@admin123";

    const existingAdmin = await userModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const hashPassword = await bcrypt.hash(adminPassword, salt);
      const newAdmin = await userModel.create({
        name: "Cartivo Administrator",
        email: adminEmail,
        password: hashPassword,
        role: "admin",
        isActive: true,
        phone: "+91 98765 00001",
      });
      console.log(`🛡️ [Auth] Default admin initialized: ${newAdmin.email}`);
    } else {
      let updated = false;
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        updated = true;
      }
      if (!existingAdmin.isActive) {
        existingAdmin.isActive = true;
        updated = true;
      }
      if (existingAdmin.lockedUntil) {
        existingAdmin.lockedUntil = null;
        existingAdmin.loginAttempts = 0;
        updated = true;
      }
      if (updated) {
        await existingAdmin.save();
        console.log(`🛡️ [Auth] Admin account verified: ${existingAdmin.email}`);
      }
    }
  } catch (err) {
    console.warn("⚠️ [Auth] Note on admin user provisioning:", err.message);
  }
};

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
    await ensureAdminUser();
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

export default connectDB;

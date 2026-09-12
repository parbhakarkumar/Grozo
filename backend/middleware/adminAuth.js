import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

/**
 * adminAuth — Verifies JWT and ensures the user has role === "admin" in the DB.
 * Supports both `token` header and `Authorization: Bearer` format.
 * Attaches req.user = { userId, role, email } for downstream use.
 */
const adminAuth = async (req, res, next) => {
  try {
    let token = req.headers.token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Admin access only.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Admin session expired. Please log in again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid admin token. Please log in again.",
      });
    }

    // Handle legacy string tokens (old adminLoginService format)
    if (typeof decoded === "string" || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Token format outdated. Please log in again with admin credentials.",
      });
    }

    // Check if token belongs to configured env admin
    const isEnvAdmin = decoded.role === "admin" && decoded.email === process.env.ADMIN_EMAIL;

    let adminUser = null;
    try {
      if (mongoose.connection.readyState === 1) {
        adminUser = await userModel.findById(decoded.id).select("role isActive email name");
      }
    } catch (dbErr) {
      console.warn("DB check bypassed in adminAuth:", dbErr.message);
    }

    if (!adminUser && !isEnvAdmin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found. Please log in again.",
      });
    }

    if (adminUser && !adminUser.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated. Contact system administrator.",
      });
    }

    if (adminUser && adminUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Attach full context for downstream controllers
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      userId: decoded.id,
      role: adminUser?.role || "admin",
      email: adminUser?.email || decoded.email || process.env.ADMIN_EMAIL,
      name: adminUser?.name || "Administrator",
    };
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    console.error("[adminAuth] Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Authentication service error.",
    });
  }
};

export default adminAuth;

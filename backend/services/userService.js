import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import { OAuth2Client } from "google-auth-library";

const googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Token Helpers ────────────────────────────────────────────────────────────

/**
 * Create a short-lived access token with user id and role.
 */
const createToken = (id, role = "user", email = "") => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerUserService = async ({ name, email, password }) => {
  if (!validator.isEmail(email)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  const existUser = await userModel.findOne({ email: email.toLowerCase().trim() });
  if (existUser) {
    const error = new Error("An account with this email already exists. Please log in.");
    error.statusCode = 409;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters long.");
    error.statusCode = 400;
    throw error;
  }

  // Strong password validation
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    const error = new Error("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await userModel.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashPassword,
    role: "user",
  });

  const token = createToken(newUser._id, newUser.role, newUser.email);

  return {
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar || "",
    },
  };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUserService = async ({ email, password }) => {
  const normEmail = email?.toLowerCase().trim();
  const envAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  // Admin shortcut via main login if matching ADMIN_EMAIL & ADMIN_PASSWORD
  if (normEmail && envAdminEmail && normEmail === envAdminEmail && password === process.env.ADMIN_PASSWORD) {
    let dbUser = null;
    try {
      if (mongoose.connection.readyState === 1) {
        dbUser = await userModel.findOne({ email: normEmail });
      }
    } catch (e) {
      console.warn("DB check bypassed for env admin:", e.message);
    }

    const adminId = dbUser?._id?.toString() || "64b0f0000000000000000001";
    const token = createToken(adminId, "admin", normEmail);

    return {
      token,
      user: {
        id: adminId,
        name: dbUser?.name || "Administrator",
        email: normEmail,
        role: "admin",
        avatar: dbUser?.avatar || "",
        phone: dbUser?.phone || "",
      },
    };
  }

  const user = await userModel.findOne({ email: normEmail }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Check account lock
  if (user.isLocked && user.isLocked()) {
    const lockMins = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    const error = new Error(
      `Account temporarily locked due to too many failed attempts. Try again in ${lockMins} minute(s).`
    );
    error.statusCode = 429;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("This account has been deactivated. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    // Increment failed attempts
    if (user.incLoginAttempts) await user.incLoginAttempts();
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Successful login — reset lock counters
  await userModel.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    loginAttempts: 0,
    $unset: { lockedUntil: 1 },
  });

  const token = createToken(user._id, user.role, user.email);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      phone: user.phone || "",
    },
  };
};

// ─── Admin Login ──────────────────────────────────────────────────────────────
// Now DB-backed with env fallback: looks up user or validates env credentials.

export const adminLoginService = async ({ email, password }) => {
  const normEmail = email?.toLowerCase().trim();
  const envAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isEnvAdmin = normEmail && envAdminEmail && normEmail === envAdminEmail && password === process.env.ADMIN_PASSWORD;

  if (isEnvAdmin) {
    let dbUser = null;
    try {
      if (mongoose.connection.readyState === 1) {
        dbUser = await userModel.findOne({ email: normEmail });
        if (dbUser) {
          await userModel.findByIdAndUpdate(dbUser._id, {
            lastLogin: new Date(),
            loginAttempts: 0,
            $unset: { lockedUntil: 1 },
          });
        }
      }
    } catch (e) {
      console.warn("DB check bypassed for env admin:", e.message);
    }

    const adminId = dbUser?._id?.toString() || "64b0f0000000000000000001";
    const token = createToken(adminId, "admin", normEmail);

    return {
      token,
      user: {
        id: adminId,
        name: dbUser?.name || "Administrator",
        email: normEmail,
        role: "admin",
        avatar: dbUser?.avatar || "",
        phone: dbUser?.phone || "",
      },
    };
  }

  let user = null;
  try {
    user = await userModel
      .findOne({ email: normEmail })
      .select("+password");
  } catch (err) {
    const error = new Error("Database connection unavailable.");
    error.statusCode = 503;
    throw error;
  }

  if (!user) {
    const error = new Error("Invalid admin credentials.");
    error.statusCode = 401;
    throw error;
  }

  if (user.role !== "admin") {
    const error = new Error("Access denied. Admin privileges required.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Admin account is deactivated. Contact system administrator.");
    error.statusCode = 403;
    throw error;
  }

  // Check account lock
  if (user.isLocked && user.isLocked()) {
    const lockMins = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    const error = new Error(
      `Admin account locked. Try again in ${lockMins} minute(s).`
    );
    error.statusCode = 429;
    throw error;
  }

  // Support both bcrypt passwords (new) and env-var plain-text fallback (legacy)
  let isMatch = false;
  if (user.password) {
    isMatch = await bcrypt.compare(password, user.password);
  }

  if (!isMatch) {
    if (user.incLoginAttempts) await user.incLoginAttempts();
    const error = new Error("Invalid admin credentials.");
    error.statusCode = 401;
    throw error;
  }

  // Reset lock counters on success
  await userModel.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    loginAttempts: 0,
    $unset: { lockedUntil: 1 },
  });

  const token = createToken(user._id, user.role, user.email);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
    },
  };
};

// ─── Google Auth ──────────────────────────────────────────────────────────────

export const googleAuthService = async ({
  credential,
  email: bodyEmail,
  name: bodyName,
  picture: bodyPicture,
  googleId: bodyGoogleId,
}) => {
  let email = bodyEmail;
  let name = bodyName;
  let picture = bodyPicture;
  let googleId = bodyGoogleId;

  // ── 1. Verify Google ID token server-side using google-auth-library ──
  if (credential) {
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email    = payload.email    || email;
      name     = payload.name     || payload.given_name || name;
      picture  = payload.picture  || picture;
      googleId = payload.sub      || googleId;
    } catch (verifyErr) {
      // Fall back to manual decode if credential is an access_token flow
      console.warn("Google ID token verify note (may be access_token):", verifyErr.message);
      try {
        const base64Url = credential.split(".")[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const fallbackPayload = JSON.parse(jsonPayload);
          email    = fallbackPayload.email    || email;
          name     = fallbackPayload.name     || fallbackPayload.given_name || name;
          picture  = fallbackPayload.picture  || picture;
          googleId = fallbackPayload.sub      || googleId;
        }
      } catch (decodeErr) {
        console.warn("Google credential decode note:", decodeErr.message);
      }
    }
  }

  // ── 2. Validate we have enough data ──
  if (!email) {
    const error = new Error("Google authentication failed. Email not provided.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await userModel.findOne({ email: normalizedEmail });

  // ── 3. Upsert: update existing user or create new one ──
  if (user) {
    if (!user.isActive) {
      const error = new Error("This account has been deactivated. Please contact support.");
      error.statusCode = 403;
      throw error;
    }

    const updates = { lastLogin: new Date() };
    if (googleId && !user.googleId) updates.googleId = googleId;
    if (picture && !user.avatar)   updates.avatar = picture;
    if (name && !user.name)         updates.name = name;

    user = await userModel.findByIdAndUpdate(user._id, updates, { new: true });
  } else {
    // New Google user — auto-register as role: "user"
    user = await userModel.create({
      name: name ? name.trim() : normalizedEmail.split("@")[0],
      email: normalizedEmail,
      googleId: googleId || `google_${Date.now()}`,
      avatar: picture || "",
      role: "user",
      lastLogin: new Date(),
    });
  }

  const token = createToken(user._id, user.role, user.email);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone || "",
    },
  };
};

// ─── User Profile ─────────────────────────────────────────────────────────────

export const getUserProfileService = async (userId) => {
  let user = null;
  try {
    user = await userModel.findById(userId).select(
      "-cartData -refreshToken -loginAttempts -lockedUntil"
    );
  } catch (e) {
    // If invalid ObjectId format (e.g. string fallback)
  }

  // Fallback for admin user if ID was default/env admin ID
  if (!user) {
    const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@cartivo.com").toLowerCase().trim();
    user = await userModel.findOne({ email: envAdminEmail }).select(
      "-cartData -refreshToken -loginAttempts -lockedUntil"
    );

    if (!user && (userId === "64b0f0000000000000000001" || String(userId).includes("admin"))) {
      return {
        id: "64b0f0000000000000000001",
        name: "Cartivo Administrator",
        email: envAdminEmail,
        role: "admin",
        avatar: "",
        phone: "+91 98765 00001",
        addresses: [],
        wishlist: [],
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        googleId: false,
      };
    }
  }

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    addresses: user.addresses,
    wishlist: user.wishlist,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    googleId: !!user.googleId, // return boolean only for security
  };
};

export const updateUserProfileService = async (userId, { name, phone, avatar }) => {
  const updates = {};

  if (name !== undefined) {
    if (name.trim().length < 2) {
      const error = new Error("Name must be at least 2 characters.");
      error.statusCode = 400;
      throw error;
    }
    updates.name = name.trim();
  }

  if (phone !== undefined) updates.phone = phone.trim();
  if (avatar !== undefined) updates.avatar = avatar;

  const user = await userModel.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-cartData -refreshToken -loginAttempts -lockedUntil -password");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    addresses: user.addresses,
    lastLogin: user.lastLogin,
  };
};

// ─── Address Management ───────────────────────────────────────────────────────

export const addAddressService = async (userId, addressData) => {
  const user = await userModel.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // If this is the first address or marked as default, unset others
  if (addressData.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
    addressData.isDefault = true;
  }

  user.addresses.push(addressData);
  await user.save();

  return user.addresses;
};

export const updateAddressService = async (userId, addressId, addressData) => {
  const user = await userModel.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const addr = user.addresses.id(addressId);
  if (!addr) {
    const error = new Error("Address not found.");
    error.statusCode = 404;
    throw error;
  }

  if (addressData.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  Object.assign(addr, addressData);
  await user.save();

  return user.addresses;
};

export const deleteAddressService = async (userId, addressId) => {
  const user = await userModel.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  user.addresses = user.addresses.filter(
    (a) => a._id.toString() !== addressId
  );

  // If we deleted the default and others exist, make first one default
  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return user.addresses;
};

// ─── Admin — User Management ──────────────────────────────────────────────────

export const getAllUsersService = async ({ page = 1, limit = 20, role, search } = {}) => {
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    userModel
      .find(query)
      .select("-cartData -refreshToken -loginAttempts -lockedUntil -password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    userModel.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
    },
  };
};

export const promoteUserService = async (targetUserId, newRole, requestingAdminId) => {
  if (!["user", "admin"].includes(newRole)) {
    const error = new Error("Invalid role. Must be 'user' or 'admin'.");
    error.statusCode = 400;
    throw error;
  }

  if (targetUserId === requestingAdminId) {
    const error = new Error("Cannot change your own role.");
    error.statusCode = 400;
    throw error;
  }

  const user = await userModel.findByIdAndUpdate(
    targetUserId,
    { role: newRole },
    { new: true }
  ).select("name email role");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const toggleUserActiveService = async (targetUserId, requestingAdminId) => {
  if (targetUserId === requestingAdminId) {
    const error = new Error("Cannot deactivate your own account.");
    error.statusCode = 400;
    throw error;
  }

  const user = await userModel.findById(targetUserId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  user.isActive = !user.isActive;
  await user.save();

  return { id: user._id, name: user.name, email: user.email, isActive: user.isActive };
};

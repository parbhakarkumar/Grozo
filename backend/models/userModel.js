import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label:    { type: String, default: "Home" },        // e.g. Home, Work, Other
    firstName:{ type: String, default: "" },
    lastName: { type: String, default: "" },
    street:   { type: String, default: "" },
    city:     { type: String, default: "" },
    state:    { type: String, default: "" },
    zipcode:  { type: String, default: "" },
    country:  { type: String, default: "India" },
    phone:    { type: String, default: "" },
    isDefault:{ type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    // Saved delivery addresses
    addresses: {
      type: [addressSchema],
      default: [],
    },
    cartData: {
      type: Object,
      default: {},
    },
    wishlist: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // ─── Security & Brute-Force Protection ───────
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    // ─── Refresh Token Rotation ───────────────────
    refreshToken: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

// Instance helper — check if account is temporarily locked
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

// Instance helper — increment failed login attempts, lock after 5 failures (15 min lock)
userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    // Lock window expired — reset
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockedUntil: 1 } });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockedUntil: new Date(Date.now() + LOCK_TIME) };
  }
  return this.updateOne(updates);
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;

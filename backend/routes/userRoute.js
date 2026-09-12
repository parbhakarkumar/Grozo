import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  googleAuth,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  promoteUser,
  toggleUserActive,
} from "../controllers/userController.js";
import authUser from "../middleware/Auth.js";
import adminAuth from "../middleware/adminAuth.js";

const userRouter = express.Router();

// ── Public routes ────────────────────────────
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/google", googleAuth);

// ── Authenticated user routes ────────────────
userRouter.get("/profile", authUser, getProfile);
userRouter.put("/profile", authUser, updateProfile);
userRouter.post("/address", authUser, addAddress);
userRouter.put("/address/:addressId", authUser, updateAddress);
userRouter.delete("/address/:addressId", authUser, deleteAddress);

// ── Admin-only routes ────────────────────────
userRouter.get("/all", adminAuth, getAllUsers);
userRouter.post("/promote", adminAuth, promoteUser);
userRouter.post("/toggle-active", adminAuth, toggleUserActive);

export default userRouter;
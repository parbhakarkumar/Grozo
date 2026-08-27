import asyncHandler from "../utils/asyncHandler.js";
import {
  registerUserService,
  loginUserService,
  adminLoginService,
  googleAuthService,
} from "../services/userService.js";

// ─────────────────────────────────────────────
// POST /api/user/register
// ─────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const result = await registerUserService(req.body);
  return res.status(201).json({
    success: true,
    message: "Account created successfully. Welcome to ShopEase!",
    ...result,
  });
});

// ─────────────────────────────────────────────
// POST /api/user/login
// ─────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const result = await loginUserService(req.body);
  return res.status(200).json({
    success: true,
    message: "Welcome back!",
    ...result,
  });
});

// ─────────────────────────────────────────────
// POST /api/user/admin
// ─────────────────────────────────────────────
const adminLogin = asyncHandler(async (req, res) => {
  const result = await adminLoginService(req.body);
  return res.status(200).json({
    success: true,
    message: "Admin login successful.",
    ...result,
  });
});

// ─────────────────────────────────────────────
// POST /api/user/google
// ─────────────────────────────────────────────
const googleAuth = asyncHandler(async (req, res) => {
  const result = await googleAuthService(req.body);
  return res.status(200).json({
    success: true,
    message: `Welcome ${result.user.name}!`,
    ...result,
  });
});

export { registerUser, loginUser, adminLogin, googleAuth };

import asyncHandler from "../utils/asyncHandler.js";
import {
  registerUserService,
  loginUserService,
  adminLoginService,
  googleAuthService,
  getUserProfileService,
  updateUserProfileService,
  addAddressService,
  updateAddressService,
  deleteAddressService,
  getAllUsersService,
  promoteUserService,
  toggleUserActiveService,
} from "../services/userService.js";

// ─────────────────────────────────────────────
// POST /api/user/register
// ─────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const result = await registerUserService(req.body);
  return res.status(201).json({
    success: true,
    message: "Account created successfully. Welcome to Grozo!",
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

// ─────────────────────────────────────────────
// GET /api/user/profile  (authUser)
// ─────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const profile = await getUserProfileService(req.user.userId);
  return res.status(200).json({
    success: true,
    user: profile,
  });
});

// ─────────────────────────────────────────────
// PUT /api/user/profile  (authUser)
// ─────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const updated = await updateUserProfileService(req.user.userId, req.body);
  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: updated,
  });
});

// ─────────────────────────────────────────────
// POST /api/user/address  (authUser)
// ─────────────────────────────────────────────
const addAddress = asyncHandler(async (req, res) => {
  const addresses = await addAddressService(req.user.userId, req.body);
  return res.status(201).json({
    success: true,
    message: "Address added.",
    addresses,
  });
});

// ─────────────────────────────────────────────
// PUT /api/user/address/:addressId  (authUser)
// ─────────────────────────────────────────────
const updateAddress = asyncHandler(async (req, res) => {
  const addresses = await updateAddressService(
    req.user.userId,
    req.params.addressId,
    req.body
  );
  return res.status(200).json({
    success: true,
    message: "Address updated.",
    addresses,
  });
});

// ─────────────────────────────────────────────
// DELETE /api/user/address/:addressId  (authUser)
// ─────────────────────────────────────────────
const deleteAddress = asyncHandler(async (req, res) => {
  const addresses = await deleteAddressService(
    req.user.userId,
    req.params.addressId
  );
  return res.status(200).json({
    success: true,
    message: "Address removed.",
    addresses,
  });
});

// ─────────────────────────────────────────────
// GET /api/user/all  (adminAuth + roleGuard("admin"))
// ─────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await getAllUsersService({ page, limit, role, search });
  return res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────────
// POST /api/user/promote  (adminAuth)
// Body: { userId, role }
// ─────────────────────────────────────────────
const promoteUser = asyncHandler(async (req, res) => {
  const targetId = req.body.userId || req.body.targetUserId;
  const role = req.body.role || req.body.newRole;
  const user = await promoteUserService(targetId, role, req.user.userId);
  return res.status(200).json({
    success: true,
    message: `User role updated to "${role}".`,
    user,
  });
});

// ─────────────────────────────────────────────
// POST /api/user/toggle-active  (adminAuth)
// Body: { userId } or { targetUserId }
// ─────────────────────────────────────────────
const toggleUserActive = asyncHandler(async (req, res) => {
  const targetId = req.body.userId || req.body.targetUserId;
  const result = await toggleUserActiveService(targetId, req.user.userId);
  return res.status(200).json({
    success: true,
    message: result.isActive ? "User reactivated." : "User deactivated.",
    user: result,
  });
});

export {
  registerUser,
  loginUser,
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
};

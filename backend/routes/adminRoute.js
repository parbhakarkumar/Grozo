import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import {
  listCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { getAllUsers, promoteUser, toggleUserActive } from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

import { allOrders, patchOrderStatus } from "../controllers/orderController.js";

const adminRouter = express.Router();

// ── Dashboard ─────────────────────────────────
// GET /api/admin/dashboard — full KPI & analytics data
adminRouter.get("/dashboard", adminAuth, getDashboardStats);

// ── Orders Management (REST) ─────────────────
// GET /api/admin/orders — list all real orders
adminRouter.get("/orders", adminAuth, allOrders);
// PATCH /api/admin/orders/:id/status — update order status
adminRouter.patch("/orders/:id/status", adminAuth, patchOrderStatus);

// ── User Management ───────────────────────────
// GET /api/admin/users — list all users
adminRouter.get("/users", adminAuth, getAllUsers);
// POST /api/admin/promote — promote/demote user role
adminRouter.post("/promote", adminAuth, promoteUser);
// POST /api/admin/deactivate — toggle user active/inactive
adminRouter.post("/deactivate", adminAuth, toggleUserActive);

// ── Category Management ───────────────────────
// GET /api/admin/categories — list all categories (public)
adminRouter.get("/categories", listCategories);
// POST /api/admin/categories — create category
adminRouter.post("/categories", adminAuth, addCategory);
// PUT /api/admin/categories/:id — update category
adminRouter.put("/categories/:id", adminAuth, updateCategory);
// DELETE /api/admin/categories/:id — delete category
adminRouter.delete("/categories/:id", adminAuth, deleteCategory);

export default adminRouter;

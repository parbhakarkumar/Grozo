import express from "express";
import {
  recordLocation,
  getTracking,
  getLocationHistory,
  updatePartner,
} from "../controllers/trackingController.js";
import anyAuth, { optionalAuth } from "../middleware/anyAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const trackingRouter = express.Router();

// ── GPS Telemetry Recording ──────────────────
// POST /api/tracking/:orderId/location
trackingRouter.post("/:orderId/location", anyAuth, recordLocation);

// ── Tracking Details & Live Coordinates ──────
// GET /api/tracking/:orderId
trackingRouter.get("/:orderId", optionalAuth, getTracking);

// GET /api/tracking/:orderId/location (REST alias)
trackingRouter.get("/:orderId/location", optionalAuth, getTracking);

// ── Chronological Location History ───────────
// GET /api/tracking/:orderId/history
trackingRouter.get("/:orderId/history", optionalAuth, getLocationHistory);

// ── Admin Logistics Management ───────────────
// PATCH /api/tracking/:orderId/partner
trackingRouter.patch("/:orderId/partner", adminAuth, updatePartner);

export default trackingRouter;

import asyncHandler from "../utils/asyncHandler.js";
import {
  recordGpsLocationService,
  getTrackingDetailsService,
  getLocationHistoryService,
  updateTrackingPartnerService,
} from "../services/trackingService.js";

// ─────────────────────────────────────────────
// POST /api/tracking/:orderId/location
// Transmits real GPS coordinates from authorized device
// ─────────────────────────────────────────────
export const recordLocation = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { latitude, longitude, accuracy, deviceSession, trackingId } = req.body;

  const { tracking, order } = await recordGpsLocationService({
    orderId,
    trackingId,
    latitude,
    longitude,
    accuracy,
    deviceSession,
    user: req.user,
  });

  // Real-Time Socket.IO Synchronization
  const io = req.app.get("io");
  if (io) {
    const payload = {
      orderId: tracking.orderId,
      trackingId: tracking.trackingId,
      currentLocation: tracking.currentLocation,
      distanceKm: tracking.distanceKm,
      etaMinutes: tracking.etaMinutes,
      routeCoordinates: tracking.routeCoordinates,
      lastUpdated: tracking.lastUpdated,
      status: tracking.status,
    };

    // Broadcast to admin room
    io.to("admin_room").emit("location_updated", payload);

    // Broadcast to specific customer
    if (order?.userId) {
      io.to(`user_${order.userId}`).emit("location_updated", payload);
    }

    // Broadcast to specific order tracking room
    io.to(`order_${tracking.orderId}`).emit("location_updated", payload);
    io.to(`order_${tracking.trackingId}`).emit("location_updated", payload);
  }

  return res.status(200).json({
    success: true,
    message: "Live location recorded successfully.",
    tracking,
  });
});

// ─────────────────────────────────────────────
// GET /api/tracking/:orderId
// Returns tracking data, real map coordinates, and ETA
// ─────────────────────────────────────────────
export const getTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const { tracking, order } = await getTrackingDetailsService(orderId, req.user);

  return res.status(200).json({
    success: true,
    tracking,
    order: {
      _id: order._id,
      trackingId: order.trackingId,
      status: order.status,
      amount: order.amount,
      address: order.address,
      items: order.items,
      payment: order.payment,
      paymentMethod: order.paymentMethod,
      courierPartner: order.courierPartner,
      deliveryOtp: order.deliveryOtp,
      createdAt: order.createdAt,
      statusHistory: order.statusHistory,
    },
  });
});

// ─────────────────────────────────────────────
// GET /api/tracking/:orderId/history
// Returns chronological GPS history points
// ─────────────────────────────────────────────
export const getLocationHistory = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const history = await getLocationHistoryService(orderId, req.user);

  return res.status(200).json({
    success: true,
    count: history.length,
    history,
  });
});

// ─────────────────────────────────────────────
// PATCH /api/tracking/:orderId/partner (Admin only)
// ─────────────────────────────────────────────
export const updatePartner = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { deliveryPartner, status } = req.body;

  const { tracking, order } = await updateTrackingPartnerService({
    orderId,
    deliveryPartner,
    status,
  });

  const io = req.app.get("io");
  if (io && status) {
    const payload = {
      orderId: order._id,
      status: order.status,
      order,
    };
    io.to("admin_room").emit("order_status_updated", payload);
    if (order.userId) {
      io.to(`user_${order.userId}`).emit("order_status_updated", payload);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Tracking details updated successfully.",
    tracking,
    order,
  });
});

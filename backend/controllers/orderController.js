import asyncHandler from "../utils/asyncHandler.js";
import {
  placeOrderService,
  placeOrderStripeService,
  allOrdersService,
  userOrdersService,
  updateStatusService,
  verifyStripePaymentService,
  updateOrderTrackingService,
  verifyDeliveryOtpService,
  cancelOrderService,
} from "../services/orderService.js";

// ─────────────────────────────────────────────
// POST /api/order/place — COD Order
// ─────────────────────────────────────────────
const placeOrder = asyncHandler(async (req, res) => {
  const newOrder = await placeOrderService(req.body);

  // Emit real-time socket events
  const io = req.app.get("io");
  if (io) {
    io.to("admin_room").emit("new_order", {
      order: newOrder,
      message: `New COD Order #${newOrder._id.toString().slice(-6)} received!`,
    });
    io.to(`user_${req.body.userId}`).emit("user_order_placed", {
      order: newOrder,
      message: "Your order has been placed successfully!",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    orderId: newOrder._id,
  });
});

// ─────────────────────────────────────────────
// POST /api/order/stripe — Stripe Payment
// ─────────────────────────────────────────────
const placeOrderStripe = asyncHandler(async (req, res) => {
  const { origin } = req.headers;
  const { session_url } = await placeOrderStripeService({ ...req.body, origin });

  return res.status(200).json({
    success: true,
    session_url,
  });
});

// ─────────────────────────────────────────────
// POST /api/order/razorpay — Razorpay (stub)
// ─────────────────────────────────────────────
const placeOrderRazorpay = asyncHandler(async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Razorpay integration coming soon.",
  });
});

// ─────────────────────────────────────────────
// POST /api/order/list (Admin only)
// ─────────────────────────────────────────────
const allOrders = asyncHandler(async (req, res) => {
  const orders = await allOrdersService();

  return res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// ─────────────────────────────────────────────
// POST /api/order/userorders
// ─────────────────────────────────────────────
const userOrders = asyncHandler(async (req, res) => {
  const orders = await userOrdersService(req.body.userId);

  return res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

// ─────────────────────────────────────────────
// POST /api/order/status (Admin only)
// ─────────────────────────────────────────────
const updateStatus = asyncHandler(async (req, res) => {
  const order = await updateStatusService(req.body);

  // Real-time socket notification
  const io = req.app.get("io");
  if (io) {
    io.to("admin_room").emit("order_status_updated", {
      orderId: order._id,
      status: order.status,
      order,
    });
    io.to(`user_${order.userId}`).emit("order_status_updated", {
      orderId: order._id,
      status: order.status,
      order,
      message: `Your order status changed to "${order.status}"`,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully.",
    order,
  });
});

// ─────────────────────────────────────────────
// POST /api/order/tracking (Admin only)
// ─────────────────────────────────────────────
const updateTracking = asyncHandler(async (req, res) => {
  const order = await updateOrderTrackingService(req.body);

  const io = req.app.get("io");
  if (io) {
    io.to("admin_room").emit("order_status_updated", {
      orderId: order._id,
      status: order.status,
      order,
    });
    io.to(`user_${order.userId}`).emit("order_status_updated", {
      orderId: order._id,
      status: order.status,
      order,
      message: `Tracking info updated: ${order.courierPartner} (#${order.trackingId})`,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Tracking details saved.",
    order,
  });
});

// ─────────────────────────────────────────────
// POST /api/order/verify-otp (Admin only / Delivery Handover)
// ─────────────────────────────────────────────
const verifyDeliveryOtp = asyncHandler(async (req, res) => {
  const result = await verifyDeliveryOtpService(req.body);

  const io = req.app.get("io");
  if (io && result.order) {
    io.to("admin_room").emit("order_status_updated", {
      orderId: result.order._id,
      status: result.order.status,
      order: result.order,
    });
    io.to(`user_${result.order.userId}`).emit("order_status_updated", {
      orderId: result.order._id,
      status: result.order.status,
      order: result.order,
      message: "Order successfully delivered & OTP verified!",
    });
  }

  return res.status(200).json(result);
});

// ─────────────────────────────────────────────
// POST /api/order/cancel (User / Admin)
// ─────────────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await cancelOrderService(req.body);

  const io = req.app.get("io");
  if (io) {
    io.to("admin_room").emit("order_status_updated", {
      orderId: order._id,
      status: "Cancelled",
      order,
    });
    io.to(`user_${order.userId}`).emit("order_status_updated", {
      orderId: order._id,
      status: "Cancelled",
      order,
      message: "Your order has been cancelled and stock restored.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Order cancelled successfully.",
    order,
  });
});

// ─────────────────────────────────────────────
// POST /api/order/verifystripe
// ─────────────────────────────────────────────
const verifyStripePayment = asyncHandler(async (req, res) => {
  const result = await verifyStripePaymentService(req.body);

  if (result.success) {
    const io = req.app.get("io");
    if (io && result.order) {
      io.to("admin_room").emit("new_order", {
        order: result.order,
        message: `New Paid Stripe Order #${result.order._id.toString().slice(-6)} received!`,
      });
      io.to(`user_${req.body.userId}`).emit("user_order_placed", {
        order: result.order,
        message: "Payment confirmed! Your order is placed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified. Order confirmed.",
    });
  } else {
    return res.status(200).json({
      success: false,
      message: "Payment was not completed. Order has been cancelled.",
    });
  }
});

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  updateTracking,
  verifyDeliveryOtp,
  cancelOrder,
  verifyStripePayment,
};

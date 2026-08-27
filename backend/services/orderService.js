import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";

const currency = "inr";
const delivery_charge = 49;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured in environment variables.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Helper: Calculate risk score based on order parameters
const calculateRiskScore = (paymentMethod, amount) => {
  if (paymentMethod === "COD") {
    if (amount >= 3000) return "HIGH";
    if (amount >= 1500) return "MEDIUM";
  }
  return "LOW";
};

// Helper: Deduct product stock when an order is confirmed
const deductStock = async (items) => {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    const query = item.productId
      ? { _id: item.productId }
      : { name: item.name };

    await productModel.updateOne(
      query,
      { $inc: { stock: -Number(item.quantity || 1) } }
    );
  }
};

// Helper: Restore product stock when an order is cancelled
const restoreStock = async (items) => {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    const query = item.productId
      ? { _id: item.productId }
      : { name: item.name };

    await productModel.updateOne(
      query,
      { $inc: { stock: Number(item.quantity || 1) } }
    );
  }
};

export const placeOrderService = async ({ userId, address, amount, items }) => {
  const riskScore = calculateRiskScore("COD", amount);
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const newOrder = await orderModel.create({
    items,
    address,
    amount,
    userId,
    paymentMethod: "COD",
    payment: false,
    date: new Date(),
    riskScore,
    deliveryOtp,
    statusHistory: [
      {
        status: "Order Placed",
        timestamp: new Date(),
        note: `COD Order placed. Risk level: ${riskScore}`,
      },
    ],
  });

  // Deduct inventory stock
  await deductStock(items);

  // Clear user cart
  await userModel.findByIdAndUpdate(userId, { cartData: {} });

  return newOrder;
};

export const placeOrderStripeService = async ({ userId, address, amount, items, origin }) => {
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const newOrder = await orderModel.create({
    items,
    address,
    amount,
    userId,
    paymentMethod: "stripe",
    payment: false,
    date: new Date(),
    riskScore: "LOW",
    deliveryOtp,
    statusHistory: [
      {
        status: "Order Placed",
        timestamp: new Date(),
        note: "Stripe payment checkout initiated",
      },
    ],
  });

  const line_items = items.map((item) => ({
    price_data: {
      currency,
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  line_items.push({
    price_data: {
      currency,
      product_data: {
        name: "Delivery Charges",
      },
      unit_amount: delivery_charge * 100,
    },
    quantity: 1,
  });

  const session = await getStripe().checkout.sessions.create({
    success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
    cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
    line_items,
    mode: "payment",
    metadata: { orderId: newOrder._id.toString(), userId },
  });

  return { session_url: session.url, order: newOrder };
};

export const allOrdersService = async () => {
  const orders = await orderModel
    .find({})
    .sort({ createdAt: -1 })
    .lean();

  return orders;
};

export const userOrdersService = async (userId) => {
  const orders = await orderModel
    .find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return orders;
};

export const updateStatusService = async ({ orderId, status, note }) => {
  const existingOrder = await orderModel.findById(orderId);
  if (!existingOrder) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  // If status is being marked Delivered without OTP check, ensure warning
  const historyEntry = {
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status}`,
  };

  const updateData = {
    status,
    $push: { statusHistory: historyEntry },
  };

  const order = await orderModel.findByIdAndUpdate(
    orderId,
    updateData,
    { new: true, runValidators: true }
  );

  return order;
};

// ─────────────────────────────────────────────
// Logistics & Tracking Management
// ─────────────────────────────────────────────
export const updateOrderTrackingService = async ({
  orderId,
  courierPartner,
  trackingId,
  trackingUrl,
  estimatedDelivery,
}) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  order.courierPartner = courierPartner || order.courierPartner;
  order.trackingId = trackingId || order.trackingId;
  order.trackingUrl = trackingUrl || order.trackingUrl;
  if (estimatedDelivery) {
    order.estimatedDelivery = new Date(estimatedDelivery);
  }

  // Update status to Shipped if currently Order Placed or Packing
  if (["Order Placed", "Packing"].includes(order.status)) {
    order.status = "Shipped";
  }

  order.statusHistory.push({
    status: order.status,
    timestamp: new Date(),
    note: `Assigned courier: ${order.courierPartner} (Tracking #: ${order.trackingId})`,
  });

  await order.save();
  return order;
};

// ─────────────────────────────────────────────
// Anti-Fake Delivery: OTP Verification
// ─────────────────────────────────────────────
export const verifyDeliveryOtpService = async ({ orderId, otp }) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  if (order.status === "Delivered") {
    return { success: true, message: "Order is already marked delivered.", order };
  }

  if (order.deliveryOtp !== otp?.toString().trim()) {
    const error = new Error("Invalid Delivery OTP! Handover could not be verified.");
    error.statusCode = 400;
    throw error;
  }

  order.status = "Delivered";
  order.isOtpVerified = true;
  order.payment = true; // Auto-mark paid on verified delivery
  order.statusHistory.push({
    status: "Delivered",
    timestamp: new Date(),
    note: "Verified via Customer Delivery OTP. Legitimate delivery completed.",
  });

  await order.save();
  return { success: true, message: "OTP verified successfully. Order marked Delivered.", order };
};

// ─────────────────────────────────────────────
// Order Cancellation with Stock Restoral
// ─────────────────────────────────────────────
export const cancelOrderService = async ({ orderId, reason }) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }

  if (order.status === "Delivered") {
    const error = new Error("Delivered orders cannot be cancelled directly.");
    error.statusCode = 400;
    throw error;
  }

  order.status = "Cancelled";
  order.cancellationReason = reason || "Cancelled by admin/customer";
  order.statusHistory.push({
    status: "Cancelled",
    timestamp: new Date(),
    note: `Order cancelled. Reason: ${order.cancellationReason}. Stock restored.`,
  });

  await order.save();

  // Restore inventory
  await restoreStock(order.items);

  return order;
};

export const verifyStripePaymentService = async ({ orderId, success, userId }) => {
  if (success === "true") {
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      {
        payment: true,
        $push: {
          statusHistory: {
            status: "Order Placed",
            timestamp: new Date(),
            note: "Stripe payment verified successfully",
          },
        },
      },
      { new: true }
    );

    if (order) {
      await deductStock(order.items);
    }

    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    return { success: true, order };
  } else {
    await orderModel.findByIdAndDelete(orderId);
    return { success: false, order: null };
  }
};

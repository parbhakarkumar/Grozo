import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    _id: false,
    productId: { type: String, default: "" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    image: { type: [String] },
  }
);

const statusHistorySchema = new mongoose.Schema(
  {
    _id: false,
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    address: {
      type: Object,
      required: [true, "Shipping address is required"],
    },
    amount: {
      type: Number,
      required: [true, "Order amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      required: true,
      default: "Order Placed",
      enum: {
        values: [
          "Order Placed",
          "Packing",
          "Shipped",
          "Out for delivery",
          "Delivered",
          "Cancelled",
          "Returned",
        ],
        message: "{VALUE} is not a valid order status",
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["COD", "stripe", "razorpay"],
    },
    payment: {
      type: Boolean,
      required: true,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },

    // ─────────────────────────────────────────────
    // Logistics & Tracking
    // ─────────────────────────────────────────────
    courierPartner: {
      type: String,
      default: "", // e.g. "Delhivery", "BlueDart", "Shadowfax", "DTDC"
    },
    trackingId: {
      type: String,
      default: "",
    },
    trackingUrl: {
      type: String,
      default: "",
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },

    // ─────────────────────────────────────────────
    // Anti-Fake Delivery & Fraud Prevention (OTP)
    // ─────────────────────────────────────────────
    deliveryOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(), // 4-digit random OTP
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    riskScore: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: "Order Placed", timestamp: new Date(), note: "Order placed by customer" }],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ trackingId: 1 });

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;

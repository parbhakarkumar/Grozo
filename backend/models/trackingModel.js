import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      unique: true,
      index: true,
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    deliveryPartner: {
      type: String,
      default: "Express Delivery",
    },
    status: {
      type: String,
      required: true,
      default: "Confirmed",
      index: true,
    },
    currentLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null }, // In meters
      timestamp: { type: Date, default: null },
      address: { type: String, default: "" },
    },
    destinationLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: "" },
      geocoded: { type: Boolean, default: false },
    },
    distanceKm: {
      type: Number,
      default: null,
    },
    etaMinutes: {
      type: Number,
      default: null,
    },
    routeCoordinates: {
      type: [[Number]], // [[lat, lng], ...]
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
trackingSchema.index({ orderId: 1, trackingId: 1 });
trackingSchema.index({ userId: 1, createdAt: -1 });

const trackingModel =
  mongoose.models.tracking || mongoose.model("tracking", trackingSchema);

export default trackingModel;

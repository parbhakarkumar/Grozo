import mongoose from "mongoose";

const locationHistorySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      index: true,
    },
    trackingId: {
      type: String,
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      default: null, // GPS accuracy in meters
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deviceSession: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

locationHistorySchema.index({ orderId: 1, timestamp: -1 });
locationHistorySchema.index({ trackingId: 1, timestamp: -1 });

const locationHistoryModel =
  mongoose.models.locationHistory ||
  mongoose.model("locationHistory", locationHistorySchema);

export default locationHistoryModel;

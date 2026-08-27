import express from "express";
import {
  allOrders,
  placeOrder,
  placeOrderRazorpay,
  placeOrderStripe,
  updateStatus,
  userOrders,
  verifyStripePayment,
  updateTracking,
  verifyDeliveryOtp,
  cancelOrder,
} from "../controllers/orderController.js";
import authUser from "../middleware/Auth.js";
import adminAuth from "../middleware/adminAuth.js";

const orderRouter = express.Router();

// Admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/tracking", adminAuth, updateTracking);
orderRouter.post("/verify-otp", adminAuth, verifyDeliveryOtp);
orderRouter.post("/admin-cancel", adminAuth, cancelOrder);

// Payment features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User features
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/cancel", authUser, cancelOrder);

// Verify payment
orderRouter.post("/verifystripe", authUser, verifyStripePayment);

export default orderRouter;

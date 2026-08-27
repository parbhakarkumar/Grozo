import { describe, it, expect } from "vitest";
import {
  placeOrderService,
  allOrdersService,
  userOrdersService,
  updateStatusService,
  verifyStripePaymentService,
  updateOrderTrackingService,
  verifyDeliveryOtpService,
  cancelOrderService,
} from "../../services/orderService.js";
import userModel from "../../models/userModel.js";
import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";

describe("Order Service Tests", () => {
  it("should place COD order, deduct stock, and clear user cart", async () => {
    const product = await productModel.create({
      name: "Casual T-Shirt",
      description: "Cotton tee",
      price: 750,
      category: "Men",
      subCategory: "Topwear",
      sizes: ["M"],
      image: ["https://example.com/tee.jpg"],
      stock: 20,
    });

    const user = await userModel.create({
      name: "Order Tester",
      email: "order@example.com",
      password: "hashedpassword",
      cartData: { [product._id]: { M: 2 } },
    });

    const orderData = {
      userId: user._id.toString(),
      amount: 1500,
      address: {
        firstName: "Jane",
        lastName: "Doe",
        street: "123 Main St",
        city: "Mumbai",
        state: "MH",
        zipcode: "400001",
        phone: "9876543210",
      },
      items: [
        {
          productId: product._id.toString(),
          name: "Casual T-Shirt",
          price: 750,
          quantity: 2,
          size: "M",
        },
      ],
    };

    const order = await placeOrderService(orderData);
    expect(order.amount).toBe(1500);
    expect(order.paymentMethod).toBe("COD");
    expect(order.deliveryOtp).toBeDefined();

    // Check inventory stock deducted (20 - 2 = 18)
    const updatedProduct = await productModel.findById(product._id);
    expect(updatedProduct.stock).toBe(18);

    // Check user cart was cleared
    const updatedUser = await userModel.findById(user._id);
    expect(Object.keys(updatedUser.cartData).length).toBe(0);
  });

  it("should update order tracking with courier partner and AWB", async () => {
    const created = await orderModel.create({
      userId: "user_track_1",
      amount: 1200,
      address: { city: "Delhi" },
      items: [{ name: "Shoes", price: 1200, quantity: 1, size: "UK 8" }],
      paymentMethod: "COD",
    });

    const updated = await updateOrderTrackingService({
      orderId: created._id,
      courierPartner: "Delhivery",
      trackingId: "DEL123456789",
      trackingUrl: "https://track.delhivery.com/DEL123456789",
    });

    expect(updated.courierPartner).toBe("Delhivery");
    expect(updated.trackingId).toBe("DEL123456789");
    expect(updated.status).toBe("Shipped");
  });

  it("should verify delivery OTP and mark order delivered", async () => {
    const created = await orderModel.create({
      userId: "user_otp_1",
      amount: 1800,
      address: { city: "Bangalore" },
      items: [{ name: "Watch", price: 1800, quantity: 1, size: "Free" }],
      paymentMethod: "COD",
      deliveryOtp: "5678",
      payment: false,
    });

    const res = await verifyDeliveryOtpService({
      orderId: created._id,
      otp: "5678",
    });

    expect(res.success).toBe(true);
    expect(res.order.status).toBe("Delivered");
    expect(res.order.isOtpVerified).toBe(true);
    expect(res.order.payment).toBe(true);
  });

  it("should reject delivery with invalid OTP", async () => {
    const created = await orderModel.create({
      userId: "user_otp_2",
      amount: 1800,
      address: { city: "Bangalore" },
      items: [{ name: "Watch", price: 1800, quantity: 1, size: "Free" }],
      paymentMethod: "COD",
      deliveryOtp: "5678",
    });

    await expect(
      verifyDeliveryOtpService({
        orderId: created._id,
        otp: "0000",
      })
    ).rejects.toThrow("Invalid Delivery OTP!");
  });

  it("should cancel order and restore stock", async () => {
    const product = await productModel.create({
      name: "Cancel Test Item",
      description: "Item to cancel",
      price: 500,
      category: "Men",
      subCategory: "Topwear",
      sizes: ["L"],
      image: ["https://example.com/item.jpg"],
      stock: 10,
    });

    const order = await orderModel.create({
      userId: "user_cancel_1",
      amount: 500,
      address: { city: "Jaipur" },
      items: [{ productId: product._id.toString(), name: "Cancel Test Item", price: 500, quantity: 2, size: "L" }],
      paymentMethod: "COD",
    });

    await cancelOrderService({
      orderId: order._id,
      reason: "Customer changed mind",
    });

    const cancelledOrder = await orderModel.findById(order._id);
    expect(cancelledOrder.status).toBe("Cancelled");

    // Stock should be restored (10 + 2 = 12)
    const updatedProduct = await productModel.findById(product._id);
    expect(updatedProduct.stock).toBe(12);
  });

  it("should list all orders", async () => {
    await orderModel.create({
      userId: "user_123",
      amount: 500,
      address: { city: "Delhi" },
      items: [{ name: "Socks", price: 500, quantity: 1, size: "Free" }],
      paymentMethod: "COD",
    });

    const orders = await allOrdersService();
    expect(orders.length).toBeGreaterThanOrEqual(1);
  });
});

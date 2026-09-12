import { describe, it, expect } from "vitest";
import {
  generateTrackingId,
  calculateHaversineDistance,
  recordGpsLocationService,
  getTrackingDetailsService,
  getLocationHistoryService,
} from "../../services/trackingService.js";
import orderModel from "../../models/orderModel.js";
import userModel from "../../models/userModel.js";
import trackingModel from "../../models/trackingModel.js";
import locationHistoryModel from "../../models/locationHistoryModel.js";

describe("Tracking Service Tests", () => {
  it("should generate a valid TRK-XXXXXXXX format tracking ID", () => {
    const trackingId = generateTrackingId();
    expect(trackingId).toMatch(/^TRK-[0-9A-F]{8}$/);
  });

  it("should calculate accurate Haversine distance between two coordinates", () => {
    // Mumbai (19.0760, 72.8777) to Pune (18.5204, 73.8567) is approx 118-120 km
    const dist = calculateHaversineDistance(19.076, 72.8777, 18.5204, 73.8567);
    expect(dist).toBeGreaterThan(115);
    expect(dist).toBeLessThan(125);

    // Identical coords should be 0 km
    expect(calculateHaversineDistance(19.076, 72.8777, 19.076, 72.8777)).toBe(0);

    // Null coords should return null
    expect(calculateHaversineDistance(null, 72.8777, 19.076, null)).toBeNull();
  });

  it("should reject invalid latitude and longitude values", async () => {
    await expect(
      recordGpsLocationService({
        orderId: "507f1f77bcf86cd799439011",
        latitude: 95.5, // invalid > 90
        longitude: 72.8,
      })
    ).rejects.toThrow("Invalid latitude value");

    await expect(
      recordGpsLocationService({
        orderId: "507f1f77bcf86cd799439011",
        latitude: 19.0,
        longitude: 185.0, // invalid > 180
      })
    ).rejects.toThrow("Invalid longitude value");
  });

  it("should record valid GPS coordinates, update tracking, and log history", async () => {
    const user = await userModel.create({
      name: "Tracking Customer",
      email: "trackcust@test.com",
      password: "HashedPassword123!",
    });

    const order = await orderModel.create({
      userId: user._id.toString(),
      amount: 499,
      status: "Shipped",
      trackingId: generateTrackingId(),
      address: {
        street: "45 Marine Drive",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400020",
      },
      items: [
        {
          productId: "p1",
          name: "Fresh Apples",
          price: 499,
          quantity: 1,
          size: "1kg",
        },
      ],
      paymentMethod: "COD",
    });

    const tracking = await trackingModel.create({
      orderId: order._id,
      trackingId: order.trackingId,
      userId: user._id.toString(),
      status: "Shipped",
      destinationLocation: {
        latitude: 18.944,
        longitude: 72.823,
        address: "45 Marine Drive, Mumbai",
        geocoded: true,
      },
    });

    // Record legitimate GPS location as admin
    const adminUser = { role: "admin", id: "admin1" };
    const res = await recordGpsLocationService({
      orderId: order._id.toString(),
      latitude: 19.017,
      longitude: 72.83,
      accuracy: 8.5,
      deviceSession: "driver_handheld_session",
      user: adminUser,
    });

    expect(res.tracking.currentLocation.latitude).toBe(19.017);
    expect(res.tracking.currentLocation.longitude).toBe(72.83);
    expect(res.tracking.currentLocation.accuracy).toBe(8.5);
    expect(res.tracking.distanceKm).toBeGreaterThan(0);

    // Check location history was stored
    const history = await getLocationHistoryService(order._id.toString(), adminUser);
    expect(history.length).toBe(1);
    expect(history[0].latitude).toBe(19.017);
    expect(history[0].accuracy).toBe(8.5);
  });

  it("should enforce authorization: unauthorized customer cannot access another's tracking", async () => {
    const userA = await userModel.create({
      name: "Customer A",
      email: "custA@test.com",
      password: "HashedPassword123!",
    });

    const userB = await userModel.create({
      name: "Customer B",
      email: "custB@test.com",
      password: "HashedPassword123!",
    });

    const order = await orderModel.create({
      userId: userA._id.toString(),
      amount: 999,
      status: "Confirmed",
      trackingId: generateTrackingId(),
      address: { street: "10 Downing", city: "London" },
      items: [{ productId: "p2", name: "Tea", price: 999, quantity: 1, size: "500g" }],
      paymentMethod: "COD",
    });

    await trackingModel.create({
      orderId: order._id,
      trackingId: order.trackingId,
      userId: userA._id.toString(),
      status: "Confirmed",
    });

    // Customer B tries to view Customer A's order tracking
    await expect(
      getTrackingDetailsService(order._id.toString(), {
        id: userB._id.toString(),
        role: "user",
      })
    ).rejects.toThrow("Access denied");

    // Customer A can view their own tracking
    const result = await getTrackingDetailsService(order._id.toString(), {
      id: userA._id.toString(),
      role: "user",
    });
    expect(result.order._id.toString()).toBe(order._id.toString());
  });
});

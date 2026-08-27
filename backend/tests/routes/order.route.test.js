import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../server.js";
import userModel from "../../models/userModel.js";

describe("Order Routes Integration Tests", () => {
  it("GET / should return API health status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.version).toBe("2.1.0");
  });

  it("POST /api/order/list should require admin token header", async () => {
    const res = await request(app).post("/api/order/list");
    expect(res.status).toBe(401);
  });

  it("POST /api/order/list with valid admin token should return 200", async () => {
    const adminToken = jwt.sign(
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD,
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .post("/api/order/list")
      .set("token", adminToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.orders)).toBe(true);
  });

  it("POST /api/order/place with user token should create order", async () => {
    const user = await userModel.create({
      name: "Route Test User",
      email: "routetest@example.com",
      password: "password123",
    });

    const userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const payload = {
      amount: 1999,
      address: {
        firstName: "Route",
        lastName: "Tester",
        street: "456 Test Rd",
        city: "Mumbai",
        state: "Maharashtra",
        zipcode: "400002",
        phone: "9123456789",
      },
      items: [
        {
          name: "Test Sneakers",
          price: 1999,
          quantity: 1,
          size: "UK 8",
        },
      ],
    };

    const res = await request(app)
      .post("/api/order/place")
      .set("token", userToken)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("orderId");
  });
});

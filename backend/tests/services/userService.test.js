import { describe, it, expect } from "vitest";
import {
  registerUserService,
  loginUserService,
  adminLoginService,
  googleAuthService,
} from "../../services/userService.js";
import userModel from "../../models/userModel.js";

describe("User Service Tests", () => {
  it("should successfully register a new user", async () => {
    const res = await registerUserService({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(res).toHaveProperty("token");
    expect(res.user.email).toBe("john@example.com");
    expect(res.user.name).toBe("John Doe");

    const inDb = await userModel.findOne({ email: "john@example.com" });
    expect(inDb).not.toBeNull();
  });

  it("should fail registration with duplicate email", async () => {
    await registerUserService({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    await expect(
      registerUserService({
        name: "Jane Doe",
        email: "john@example.com",
        password: "password123",
      })
    ).rejects.toThrow("An account with this email already exists.");
  });

  it("should fail registration with short password", async () => {
    await expect(
      registerUserService({
        name: "John Doe",
        email: "john@example.com",
        password: "123",
      })
    ).rejects.toThrow("Password must be at least 8 characters long.");
  });

  it("should login user with correct credentials", async () => {
    await registerUserService({
      name: "Alice Smith",
      email: "alice@example.com",
      password: "securepassword123",
    });

    const res = await loginUserService({
      email: "alice@example.com",
      password: "securepassword123",
    });

    expect(res).toHaveProperty("token");
    expect(res.user.email).toBe("alice@example.com");
  });

  it("should fail login with wrong password", async () => {
    await registerUserService({
      name: "Alice Smith",
      email: "alice@example.com",
      password: "securepassword123",
    });

    await expect(
      loginUserService({
        email: "alice@example.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid email or password.");
  });

  it("should authenticate admin with valid credentials", async () => {
    const res = await adminLoginService({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    expect(res).toHaveProperty("token");
  });

  it("should reject admin with invalid credentials", async () => {
    await expect(
      adminLoginService({
        email: "wrongadmin@cartivo.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid admin credentials.");
  });

  it("should register/login user with googleAuthService", async () => {
    const res = await googleAuthService({
      email: "googleuser@example.com",
      name: "Google User",
      googleId: "google_123456",
      picture: "https://example.com/avatar.jpg",
    });

    expect(res).toHaveProperty("token");
    expect(res.user.email).toBe("googleuser@example.com");
    expect(res.user.avatar).toBe("https://example.com/avatar.jpg");
  });
});

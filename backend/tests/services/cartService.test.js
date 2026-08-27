import { describe, it, expect } from "vitest";
import {
  addToCartService,
  updateCartService,
  getUserCartService,
} from "../../services/cartService.js";
import userModel from "../../models/userModel.js";

describe("Cart Service Tests", () => {
  it("should add item to user cart", async () => {
    const user = await userModel.create({
      name: "Cart Tester",
      email: "cart@example.com",
      password: "hashedpassword",
    });

    const cart = await addToCartService({
      userId: user._id,
      itemId: "prod_101",
      size: "M",
    });

    expect(cart["prod_101"]["M"]).toBe(1);

    // Increment item
    const updatedCart = await addToCartService({
      userId: user._id,
      itemId: "prod_101",
      size: "M",
    });

    expect(updatedCart["prod_101"]["M"]).toBe(2);
  });

  it("should update quantity in user cart", async () => {
    const user = await userModel.create({
      name: "Cart Tester 2",
      email: "cart2@example.com",
      password: "hashedpassword",
    });

    await addToCartService({
      userId: user._id,
      itemId: "prod_102",
      size: "L",
    });

    const cart = await updateCartService({
      userId: user._id,
      itemId: "prod_102",
      size: "L",
      quantity: 5,
    });

    expect(cart["prod_102"]["L"]).toBe(5);
  });

  it("should remove item from cart when quantity is 0", async () => {
    const user = await userModel.create({
      name: "Cart Tester 3",
      email: "cart3@example.com",
      password: "hashedpassword",
    });

    await addToCartService({
      userId: user._id,
      itemId: "prod_103",
      size: "S",
    });

    const cart = await updateCartService({
      userId: user._id,
      itemId: "prod_103",
      size: "S",
      quantity: 0,
    });

    expect(cart["prod_103"]).toBeUndefined();
  });

  it("should fetch user cart data", async () => {
    const user = await userModel.create({
      name: "Cart Tester 4",
      email: "cart4@example.com",
      password: "hashedpassword",
    });

    await addToCartService({
      userId: user._id,
      itemId: "prod_104",
      size: "XL",
    });

    const cartData = await getUserCartService(user._id);
    expect(cartData["prod_104"]["XL"]).toBe(1);
  });
});

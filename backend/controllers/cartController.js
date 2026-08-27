import asyncHandler from "../utils/asyncHandler.js";
import {
  addToCartService,
  updateCartService,
  getUserCartService,
} from "../services/cartService.js";

// ─────────────────────────────────────────────
// POST /api/cart/add
// ─────────────────────────────────────────────
const addToCart = asyncHandler(async (req, res) => {
  const cartData = await addToCartService(req.body);

  return res.status(200).json({
    success: true,
    message: "Item added to cart.",
    cartData,
  });
});

// ─────────────────────────────────────────────
// POST /api/cart/update
// ─────────────────────────────────────────────
const updateCart = asyncHandler(async (req, res) => {
  const cartData = await updateCartService(req.body);

  return res.status(200).json({
    success: true,
    message: "Cart updated.",
    cartData,
  });
});

// ─────────────────────────────────────────────
// POST /api/cart/get
// ─────────────────────────────────────────────
const getUserCart = asyncHandler(async (req, res) => {
  const cartData = await getUserCartService(req.body.userId);

  return res.status(200).json({
    success: true,
    cartData,
  });
});

export { addToCart, updateCart, getUserCart };

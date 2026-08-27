import userModel from "../models/userModel.js";

export const addToCartService = async ({ userId, itemId, size }) => {
  const userData = await userModel.findById(userId);

  if (!userData) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const cartData = { ...userData.cartData };

  if (cartData[itemId]) {
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
  } else {
    cartData[itemId] = { [size]: 1 };
  }

  await userModel.findByIdAndUpdate(userId, { cartData });

  return cartData;
};

export const updateCartService = async ({ userId, itemId, size, quantity }) => {
  const userData = await userModel.findById(userId);

  if (!userData) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const cartData = { ...userData.cartData };

  if (!cartData[itemId]) {
    const error = new Error("Item not found in cart.");
    error.statusCode = 400;
    throw error;
  }

  if (quantity <= 0) {
    delete cartData[itemId][size];
    if (Object.keys(cartData[itemId]).length === 0) {
      delete cartData[itemId];
    }
  } else {
    cartData[itemId][size] = quantity;
  }

  await userModel.findByIdAndUpdate(userId, { cartData });

  return cartData;
};

export const getUserCartService = async (userId) => {
  const userData = await userModel.findById(userId).select("cartData");

  if (!userData) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return userData.cartData || {};
};

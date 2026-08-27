import { body } from "express-validator";

export const placeOrderRules = [
  body("items")
    .isArray({ min: 1 }).withMessage("Order must contain at least one item"),

  body("amount")
    .notEmpty().withMessage("Order amount is required")
    .isNumeric().withMessage("Amount must be a number")
    .custom((val) => Number(val) > 0).withMessage("Amount must be greater than 0"),

  body("address")
    .notEmpty().withMessage("Shipping address is required"),

  body("address.firstName")
    .trim()
    .notEmpty().withMessage("First name is required"),

  body("address.lastName")
    .trim()
    .notEmpty().withMessage("Last name is required"),

  body("address.email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email"),

  body("address.phone")
    .trim()
    .notEmpty().withMessage("Phone number is required"),

  body("address.street")
    .trim()
    .notEmpty().withMessage("Street address is required"),

  body("address.city")
    .trim()
    .notEmpty().withMessage("City is required"),

  body("address.state")
    .trim()
    .notEmpty().withMessage("State is required"),

  body("address.zipcode")
    .trim()
    .notEmpty().withMessage("Zip code is required"),
];

export const updateStatusRules = [
  body("orderId")
    .trim()
    .notEmpty().withMessage("Order ID is required")
    .isMongoId().withMessage("Invalid order ID format"),

  body("status")
    .trim()
    .notEmpty().withMessage("Status is required")
    .isIn(["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"])
    .withMessage("Invalid order status value"),
];

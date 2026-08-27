import { body } from "express-validator";

export const addProductRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ min: 2, max: 150 }).withMessage("Product name must be 2-150 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Product description is required")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isNumeric().withMessage("Price must be a number")
    .custom((val) => Number(val) > 0).withMessage("Price must be greater than 0"),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required"),

  body("subCategory")
    .trim()
    .notEmpty().withMessage("Sub-category is required"),

  body("sizes")
    .notEmpty().withMessage("Sizes are required"),
];

export const removeProductRules = [
  body("id")
    .trim()
    .notEmpty().withMessage("Product ID is required")
    .isMongoId().withMessage("Invalid product ID format"),
];

export const singleProductRules = [
  body("productId")
    .trim()
    .notEmpty().withMessage("Product ID is required")
    .isMongoId().withMessage("Invalid product ID format"),
];

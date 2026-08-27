import { validationResult } from "express-validator";

/**
 * validate — Runs express-validator checks and returns 400 on failure.
 * Should be placed after validation rule arrays in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

export default validate;

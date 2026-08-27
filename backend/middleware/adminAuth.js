import jwt from "jsonwebtoken";

/**
 * adminAuth — Verifies admin-specific JWT token from request headers.
 * Returns 401 for missing tokens, 403 for unauthorized access.
 */
const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Admin access only.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient admin permissions.",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid admin token. Please log in again.",
    });
  }
};

export default adminAuth;


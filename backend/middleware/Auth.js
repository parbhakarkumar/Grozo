import jwt from "jsonwebtoken";

/**
 * authUser — Verifies JWT token from request headers.
 * Supports both `token` header and `Authorization: Bearer <token>` format.
 * Attaches decoded { userId, role } to req.user and req.body.userId for
 * backward compatibility with existing controllers.
 */
const authUser = async (req, res, next) => {
  try {
    // Support both header formats
    let token = req.headers.token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support both old string tokens (legacy) and new object tokens
    if (typeof decoded === "string") {
      // Legacy token format — no role info, reject with re-login request
      return res.status(401).json({
        success: false,
        message: "Token format outdated. Please log in again.",
      });
    }

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload. Please log in again.",
      });
    }

    // Attach to both req.user (new) and req.body.userId (backward compat)
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      userId: decoded.id,
      role: decoded.role || "user",
      email: decoded.email || null,
    };
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token. Please log in again.",
    });
  }
};

export default authUser;

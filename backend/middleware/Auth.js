import jwt from "jsonwebtoken";

/**
 * authUser — Verifies JWT token from request headers.
 * Attaches decoded userId to req.body for use in downstream controllers.
 * Returns 401 on missing or invalid tokens.
 */
const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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


import jwt from "jsonwebtoken";

/**
 * anyAuth — Accepts any valid logged-in user or admin token.
 * Attaches req.user = { id, _id, userId, role, email }.
 */
const anyAuth = async (req, res, next) => {
  try {
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
        message: "Authentication required to access tracking.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "string" || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

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
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

/**
 * optionalAuth — Allows tracking lookups even if not logged in, but attaches user if token present.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          req.user = {
            id: decoded.id,
            _id: decoded.id,
            userId: decoded.id,
            role: decoded.role || "user",
            email: decoded.email || null,
          };
          req.body.userId = decoded.id;
        }
      } catch (err) {
        // Continue as guest
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default anyAuth;

/**
 * roleGuard — Middleware factory for role-based access control.
 * Must be used AFTER authUser or adminAuth middleware (which populate req.user).
 *
 * Usage:
 *   router.get("/admin/users", authUser, roleGuard("admin"), getUsers);
 *   router.get("/profile", authUser, roleGuard(["user", "admin"]), getProfile);
 */
const roleGuard = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

export default roleGuard;

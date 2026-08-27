import rateLimit from "express-rate-limit";

/**
 * Auth Rate Limiter
 * Limits login/register routes to 10 requests per 15 minutes per IP.
 * Protects against brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API Rate Limiter
 * Limits all other API routes to 100 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Limiter
 * For sensitive admin operations — 20 requests per 15 minutes.
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Rate limit exceeded for admin operations. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

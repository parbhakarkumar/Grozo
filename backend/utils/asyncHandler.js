/**
 * asyncHandler — Wraps async route handlers to catch promise rejections
 * and forward them to the centralized Express error middleware.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

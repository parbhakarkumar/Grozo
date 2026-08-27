/**
 * ApiResponse — Standard response shape for all API endpoints.
 * Ensures consistent { success, message, data, meta } across the codebase.
 */

class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  success(data = null, message = "Success", statusCode = 200, meta = null) {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    if (meta !== null) payload.meta = meta;
    return this.res.status(statusCode).json(payload);
  }

  created(data = null, message = "Resource created successfully") {
    return this.success(data, message, 201);
  }

  error(message = "Something went wrong", statusCode = 500, errors = null) {
    const payload = { success: false, message };
    if (errors !== null) payload.errors = errors;
    return this.res.status(statusCode).json(payload);
  }

  badRequest(message = "Bad request", errors = null) {
    return this.error(message, 400, errors);
  }

  unauthorized(message = "Unauthorized. Please log in again.") {
    return this.error(message, 401);
  }

  forbidden(message = "Access denied. Insufficient permissions.") {
    return this.error(message, 403);
  }

  notFound(message = "Resource not found") {
    return this.error(message, 404);
  }

  conflict(message = "Resource already exists") {
    return this.error(message, 409);
  }
}

// Helper factory to avoid "new ApiResponse(res)" everywhere
export const respond = (res) => new ApiResponse(res);

export default ApiResponse;

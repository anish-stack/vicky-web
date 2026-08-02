class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(m, d) { return new ApiError(400, m || "Bad request", d); }
  static unauthorized(m) { return new ApiError(401, m || "Unauthorized"); }
  static forbidden(m) { return new ApiError(403, m || "Forbidden"); }
  static notFound(m) { return new ApiError(404, m || "Not found"); }
  static conflict(m) { return new ApiError(409, m || "Conflict"); }
  static tooMany(m) { return new ApiError(429, m || "Too many requests"); }
  static internal(m) { return new ApiError(500, m || "Internal server error"); }
}
module.exports = ApiError;

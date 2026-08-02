const env = require("../config/env");
const ApiError = require("../utils/apiError");

const notFound = (req, res, next) => next(ApiError.notFound(`Route ${req.originalUrl} not found`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error.name === "ValidationError" && error.errors) {
    const details = Object.values(error.errors).map((e) => e.message);
    error = ApiError.badRequest(details.join(", "), details);
  } else if (error.name === "CastError") {
    error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    error = ApiError.conflict(`Duplicate value for ${field}`);
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(error.statusCode || 500, error.message || "Internal server error");
  }

  if (error.statusCode >= 500) console.error("[error]", err);

  res.status(error.statusCode).json({
    status: false,
    message: error.message,
    ...(error.details ? { errors: error.details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };

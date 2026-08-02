const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User } = require("../models");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const extract = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
};

/** Hard auth — 401 when missing/invalid. */
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extract(req);
  if (!token) throw ApiError.unauthorized("Authentication token is required");

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.accessSecret);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("Account not found or disabled");

  req.user = user;
  next();
});

/** Soft auth — attaches req.user when a valid token is present, never blocks. */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extract(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(payload.sub);
    if (user && user.isActive) req.user = user;
  } catch {
    /* ignore */
  }
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden("Insufficient permissions"));
  next();
};

module.exports = { requireAuth, optionalAuth, requireRole };

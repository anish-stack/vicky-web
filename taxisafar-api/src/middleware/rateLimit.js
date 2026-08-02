const rateLimit = require("express-rate-limit");

const base = { standardHeaders: true, legacyHeaders: false };

const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 240,
  message: { status: false, message: "Too many requests, please slow down." },
});

const otpLimiter = rateLimit({
  ...base,
  windowMs: 10 * 60 * 1000,
  limit: 6,
  keyGenerator: (req) => `${req.ip}:${req.body?.phone_number || req.body?.phoneNumber || ""}`,
  message: { status: false, message: "Too many OTP requests. Try again in a few minutes." },
});

const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { status: false, message: "Too many attempts. Try again later." },
});

const mapsLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 120 });

module.exports = { apiLimiter, otpLimiter, authLimiter, mapsLimiter };

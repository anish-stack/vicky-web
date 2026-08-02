const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { RefreshToken } = require("../models");
const ApiError = require("../utils/apiError");

const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");

const signAccessToken = (user) =>
  jwt.sign(
    { sub: String(user._id || user.id), role: user.role, phone: user.phoneNumber },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessTtl }
  );

const REFRESH_MS = 30 * 24 * 60 * 60 * 1000;

async function issueRefreshToken(user, req) {
  const raw = crypto.randomBytes(48).toString("hex");
  await RefreshToken.create({
    user: user._id || user.id,
    tokenHash: hash(raw),
    userAgent: req?.headers?.["user-agent"] || null,
    ip: req?.ip || null,
    expiresAt: new Date(Date.now() + REFRESH_MS),
  });
  return raw;
}

/** Rotate: consume old token, issue a new one. Detects reuse of a revoked token. */
async function rotateRefreshToken(raw, req) {
  const tokenHash = hash(raw);
  const existing = await RefreshToken.findOne({ tokenHash }).populate("user");
  if (!existing) throw ApiError.unauthorized("Invalid refresh token");

  if (existing.revokedAt) {
    // theft detection — kill every session for this user
    await RefreshToken.updateMany(
      { user: existing.user, revokedAt: null },
      { revokedAt: new Date() }
    );
    throw ApiError.unauthorized("Refresh token reuse detected. Please sign in again.");
  }

  if (existing.expiresAt < new Date()) throw ApiError.unauthorized("Refresh token expired");
  if (!existing.user || !existing.user.isActive) throw ApiError.unauthorized("Account disabled");

  const newRaw = await issueRefreshToken(existing.user, req);
  existing.revokedAt = new Date();
  existing.replacedBy = hash(newRaw);
  await existing.save();

  return { user: existing.user, refreshToken: newRaw, accessToken: signAccessToken(existing.user) };
}

async function revokeRefreshToken(raw) {
  if (!raw) return;
  await RefreshToken.findOneAndUpdate({ tokenHash: hash(raw) }, { revokedAt: new Date() });
}

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  path: "/api/auth",
  maxAge: REFRESH_MS,
});

module.exports = {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  refreshCookieOptions,
};

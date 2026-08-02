const Joi = require("joi");
const { User, Trip } = require("../models");
const otpService = require("../services/otp.service");
const tokenService = require("../services/token.service");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");

const phoneRule = Joi.string().min(10).max(15).required();

const schemas = {
  sendOtp: Joi.object({
    phone_number: phoneRule,
    purpose: Joi.string().valid("login", "register", "booking", "verify").default("login"),
    trip_id: Joi.string().hex().length(24).allow(null, ""),
  }),
  verifyOtp: Joi.object({
    phone_number: phoneRule,
    otp: Joi.string().length(6).required(),
    purpose: Joi.string().valid("login", "register", "booking", "verify").default("login"),
    name: Joi.string().max(80).allow("", null),
    email: Joi.string().email().allow("", null),
  }),
  adminLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

/** POST /api/auth/send-otp */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone_number, purpose, trip_id } = req.body;

  if (purpose === "login") {
    const phone = otpService.normalizePhone(phone_number);
    const exists = await User.exists({ phoneNumber: phone });
    if (!exists) throw ApiError.notFound("No account found with this number. Please register first.");
  }

  const result = await otpService.issueOtp(phone_number, purpose, trip_id || null);
  return ok(res, result, "OTP sent successfully");
});

/** POST /api/auth/verify-otp — logs in, or creates the customer on first use. */
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone_number, otp, purpose, name, email } = req.body;

  const { phoneNumber, tripRef } = await otpService.verifyOtp(phone_number, otp, purpose);

  let user = await User.findOne({ phoneNumber });
  let isNew = false;

  if (!user) {
    user = await User.create({
      phoneNumber,
      name: name || "",
      email: email || null,
      role: "customer",
      isPhoneVerified: true,
    });
    isNew = true;
  } else {
    if (!user.isActive) throw ApiError.forbidden("This account has been disabled");
    if (name && !user.name) user.name = name;
    if (email && !user.email) user.email = email;
    user.isPhoneVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
  }

  // attach a guest trip raised before login
  if (tripRef) await Trip.findByIdAndUpdate(tripRef, { user: user._id });

  const accessToken = tokenService.signAccessToken(user);
  const refreshToken = await tokenService.issueRefreshToken(user, req);
  res.cookie("refresh_token", refreshToken, tokenService.refreshCookieOptions());

  return ok(
    res,
    { user: user.toJSON(), accessToken, isNewUser: isNew },
    isNew ? "Account created successfully" : "Logged in successfully"
  );
});

/** POST /api/auth/login — email + password (staff/admin). */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (!user.isActive) throw ApiError.forbidden("This account has been disabled");

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = tokenService.signAccessToken(user);
  const refreshToken = await tokenService.issueRefreshToken(user, req);
  res.cookie("refresh_token", refreshToken, tokenService.refreshCookieOptions());

  const safe = user.toJSON();
  delete safe.password;
  return ok(res, { user: safe, accessToken }, "Logged in successfully");
});

/** POST /api/auth/refresh */
const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refresh_token || req.body?.refresh_token;
  if (!raw) throw ApiError.unauthorized("Refresh token missing");

  const { user, accessToken, refreshToken } = await tokenService.rotateRefreshToken(raw, req);
  res.cookie("refresh_token", refreshToken, tokenService.refreshCookieOptions());

  return ok(res, { user: user.toJSON(), accessToken }, "Token refreshed");
});

/** POST /api/auth/logout */
const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.refresh_token || req.body?.refresh_token;
  await tokenService.revokeRefreshToken(raw);
  res.clearCookie("refresh_token", { ...tokenService.refreshCookieOptions(), maxAge: 0 });
  return ok(res, null, "Logged out successfully");
});

/** GET /api/auth/me */
const me = asyncHandler(async (req, res) => ok(res, req.user.toJSON(), "Profile fetched"));

/** PUT /api/auth/me */
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "email", "image", "address", "city", "pinCode", "gender"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  return ok(res, req.user.toJSON(), "Profile updated successfully");
});

/** POST /api/auth/register — password account, used for staff seeding. */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone_number, role = "customer" } = req.body;
  if (await User.exists({ email: String(email).toLowerCase() })) {
    throw ApiError.conflict("An account with this email already exists");
  }
  const user = await User.create({
    name,
    email: String(email).toLowerCase(),
    password,
    phoneNumber: otpService.normalizePhone(phone_number),
    role: ["customer", "driver", "partner"].includes(role) ? role : "customer",
  });
  const safe = user.toJSON();
  delete safe.password;
  return created(res, safe, "Account created successfully");
});

module.exports = { schemas, sendOtp, verifyOtp, login, refresh, logout, me, updateMe, register };

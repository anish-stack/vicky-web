require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const env = {
  isProd,
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taxisafar",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",").map((s) => s.trim()).filter(Boolean),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:5000",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL || "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL || "30d",
  },

  razorpay: {
    keyId: isProd ? process.env.RAZORPAY_LIVE_KEY_ID : process.env.RAZORPAY_TEST_KEY_ID,
    keySecret: isProd ? process.env.RAZORPAY_LIVE_KEY_SECRET : process.env.RAZORPAY_TEST_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,

  myoperator: {
    apiKey: process.env.MYOPERATOR_API_KEY,
    companyId: process.env.MYOPERATOR_COMPANY_ID,
    phoneNumberId: process.env.MYOPERATOR_PHONE_NUMBER_ID,
  },

  otp: {
    ttlMinutes: Number(process.env.OTP_TTL_MINUTES || 10),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  },
};

if (isProd) {
  const missing = [
    ["JWT_ACCESS_SECRET", env.jwt.accessSecret],
    ["JWT_REFRESH_SECRET", env.jwt.refreshSecret],
    ["MONGO_URI", process.env.MONGO_URI],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) throw new Error(`Missing env vars in production: ${missing.join(", ")}`);
} else {
  env.jwt.accessSecret = env.jwt.accessSecret || "dev-access-secret";
  env.jwt.refreshSecret = env.jwt.refreshSecret || "dev-refresh-secret";
}

module.exports = env;

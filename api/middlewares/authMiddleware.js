const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  // Fail fast on boot in production instead of silently using a weak key.
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set. Refusing to start in production.");
  } else {
    console.warn("[auth] JWT_SECRET is not set. Using an insecure dev fallback.");
  }
}

const KEY = SECRET_KEY || "dev-insecure-secret";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ status: false, message: "Token is required for authentication" });
  }

  try {
    const decoded = jwt.verify(token, KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;

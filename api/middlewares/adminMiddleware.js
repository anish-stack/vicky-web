const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models");

const KEY = process.env.JWT_SECRET || "dev-insecure-secret";
const ADMIN_ROLES = ["superadmin"];

/**
 * Verifies the JWT and confirms the user still exists with an admin role.
 * Old admin tokens carry no role claim, so the role is always read from the DB.
 */
const adminMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(403)
      .json({ status: false, message: "Token is required for authentication" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, KEY);
  } catch (error) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid or expired token" });
  }

  try {
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role"],
    });
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return res
        .status(403)
        .json({ status: false, message: "Admin access required" });
    }
    req.user = { ...decoded, id: user.id, role: user.role, email: user.email };
    next();
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = adminMiddleware;
module.exports.ADMIN_ROLES = ADMIN_ROLES;

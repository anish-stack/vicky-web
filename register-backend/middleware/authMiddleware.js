const User = require("../models/User");
const { verifyToken } = require("../utils/Jwtutils");

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select("-otp -otpExpires -otpAttempts");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User belonging to this token no longer exists."
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please login again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token." });
        }
        return res.status(500).json({ success: false, message: "Authentication error." });
    }
};

exports.adminOnly = (req, res, next) => {
    const adminToken = req.headers["x-admin-token"];

    if (!adminToken || adminToken !== process.env.ADMIN_SECRET_TOKEN) {
        return res.status(403).json({
            success: false,
            message: "Forbidden. Admin access only."
        });
    }

    next();
};
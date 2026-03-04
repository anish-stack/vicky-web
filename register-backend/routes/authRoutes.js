const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyRegisterOTP,
    sendLoginOTP,
    verifyLoginOTP,
    adminVerifyUser,
    paymentSuccessWebhook,
    activateProfile,
    getAllUsersByCategory,
    getUserProfile,
    resendOTP
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadUserImages } = require("../middleware/Uploadmiddleware");
const {
    registerRules,
    verifyOTPRules,
    sendOTPRules,
    adminVerifyRules,
    categoryRules,
    validate
} = require("../middleware/Validationmiddleware");


// Register new user (multipart/form-data with optional image uploads)
router.post(
    "/register",
    uploadUserImages,
    registerRules,
    validate,
    registerUser
);

// Verify registration OTP
router.post(
    "/verify-register-otp",
    verifyOTPRules,
    validate,
    verifyRegisterOTP
);

// Send login OTP
router.post(
    "/send-login-otp",
    sendOTPRules,
    validate,
    sendLoginOTP
);

// Verify login OTP → returns JWT
router.post(
    "/verify-login-otp",
    verifyOTPRules,
    validate,
    verifyLoginOTP
);

// Resend OTP (register or login)
router.post(
    "/resend-otp",
    sendOTPRules,
    validate,
    resendOTP
);

// ─── User Routes ──────────────────────────────────────────────────────────────

// Get all verified users by category (public)
router.get(
    "/users",
    categoryRules,
    validate,
    getAllUsersByCategory
);

// Get single user profile (public for active profiles; full for owner)
// protect is optional here – attach user if token present
router.get(
    "/users/:userId",
    (req, res, next) => {
   
        if (req.headers.authorization) {
            return protect(req, res, next);
        }
        next();
    },
    getUserProfile
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// Admin: verify user and generate payment link
router.post(
    "/admin/verify-user/:userId",
    adminOnly,
    adminVerifyRules,
    validate,
    adminVerifyUser
);

// Admin: activate profile after payment
router.post(
    "/admin/activate-profile/:userId",
    adminOnly,
    activateProfile
);

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────
// IMPORTANT: This route needs raw body for signature verification
// Register BEFORE express.json() middleware using express.raw()
router.post(
    "/webhook/razorpay",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
        // Attach raw body string for signature verification
        if (Buffer.isBuffer(req.body)) {
            req.rawBody = req.body.toString("utf8");
            req.body = JSON.parse(req.rawBody);
        }
        next();
    },
    paymentSuccessWebhook
);

module.exports = router;
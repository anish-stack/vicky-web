const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyRegisterOTP,
    sendLoginOTP,
    verifyLoginOTP,
    adminVerifyUser,
    paymentSuccessRedirect,
    activateProfile,
    getAllUsersByCategory,
    getUserProfile,
    resendOTP,
    deactivateProfile,
    reactivateProfile,
    adminUpdatePartner,
    deletePartner
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
    // adminOnly,
    // adminVerifyRules,
    validate,
    adminVerifyUser
);

// Admin: activate profile after payment
router.post(
    "/admin/activate-profile/:userId",
   
    activateProfile
);

router.patch("/admin/partner/:userId/deactivate", deactivateProfile);

// reactivate
router.patch("/admin/partner/:userId/reactivate", reactivateProfile);

// update partner
router.put("/admin/partner/:userId", adminUpdatePartner);

// delete partner
router.delete("/admin/partner/:userId", deletePartner);

router.get(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    try {
      // Razorpay sends raw buffer
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body.toString("utf8");
        req.body = JSON.parse(req.rawBody);
      }

      next();
    } catch (err) {
      console.error("Webhook body parse error:", err);
      return res.status(400).json({ success: false, message: "Invalid JSON" });
    }
  },
  paymentSuccessRedirect
);

module.exports = router;
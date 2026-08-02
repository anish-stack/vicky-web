const router = require("express").Router();
const c = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { otpLimiter, authLimiter } = require("../middleware/rateLimit");

router.post("/send-otp", otpLimiter, validate(c.schemas.sendOtp), c.sendOtp);
router.post("/verify-otp", authLimiter, validate(c.schemas.verifyOtp), c.verifyOtp);
router.post("/login", authLimiter, validate(c.schemas.adminLogin), c.login);
router.post("/register", authLimiter, c.register);
router.post("/refresh", c.refresh);
router.post("/logout", c.logout);

router.get("/me", requireAuth, c.me);
router.put("/me", requireAuth, c.updateMe);

module.exports = router;

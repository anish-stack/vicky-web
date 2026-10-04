const express = require("express");
const router = express.Router();

const controller = require("../controllers/tourPackageBookingController");
const couponController = require("../controllers/tourCouponController");
const adminMiddleware = require("../middlewares/adminMiddleware");

// ---------------- public / customer ----------------
router.get("/availability", controller.availability);
router.get("/coupons", couponController.publicList);
router.post("/coupon/validate", couponController.validate);
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);
router.post("/create-order", controller.createOrder);
router.post("/verify-payment", controller.verifyPayment);
router.get("/booking-ref/:ref", controller.getByRef);
router.get("/my", controller.myBookings);

// ---------------- admin ----------------
router.get("/admin/list", adminMiddleware, controller.adminList);
router.get("/admin/:id", adminMiddleware, controller.adminGet);
router.put("/admin/:id", adminMiddleware, controller.adminUpdate);
router.put("/admin/:id/driver-details", adminMiddleware, controller.sendDriverDetails);





module.exports = router;
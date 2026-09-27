const express = require("express");
const router = express.Router();
const { update, getById, checkBookingAvailable } = require("../controllers/bookingLimitController");
const admin = require("../middlewares/adminMiddleware");

router.post("/check_booking_available", checkBookingAvailable);
router.put("/:id", admin, update);
router.get("/:id", admin, getById);

module.exports = router;

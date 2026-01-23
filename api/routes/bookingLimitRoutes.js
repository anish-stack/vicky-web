const express = require("express");
const router = express.Router();
const {
	update,
	getById,
	checkBookingAvailable,
} = require("../controllers/bookingLimitController");

const authMiddleware = require("../middlewares/authMiddleware");

router.put("/:id", authMiddleware, update);
router.get("/:id", authMiddleware, getById);

router.post("/check_booking_available", checkBookingAvailable);

module.exports = router;

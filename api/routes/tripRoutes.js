const express = require("express");
const router = express.Router();
const {
  createTrip,
  getById,
  getAllTrips,
  changeTripStatus,
  cancelTrip,
  completeTrip,
  markConverted,
  markUnConverted,
} = require("../controllers/tripController");
const authMiddleware = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");

router.post("/", authMiddleware, createTrip);
router.get("/:id", getById);
// customers only see their own trips (scoped inside the controller)
router.get("/", authMiddleware, getAllTrips);
// customers may cancel their own trip; admins any trip
router.patch("/:id/cancel", authMiddleware, cancelTrip);
router.patch("/:id/convert", admin, markConverted);
router.patch("/:id/unconvert", admin, markUnConverted);
router.patch("/:id/status", admin, changeTripStatus);
router.patch("/:id/complete", admin, completeTrip);

module.exports = router;

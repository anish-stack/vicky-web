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

router.post("/", authMiddleware, createTrip);
router.get("/:id", getById);
router.get("/", getAllTrips);
router.patch("/:id/cancel", cancelTrip);
router.patch("/:id/convert", markConverted);
router.patch("/:id/unconvert", markUnConverted);
router.patch("/:id/status", changeTripStatus);
router.patch("/:id/complete", completeTrip);


module.exports = router;

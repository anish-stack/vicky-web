const express = require("express");
const router = express.Router();
const {
  createTrip,
  getById,
  getAllTrips,
} = require("../controllers/tripController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", createTrip);
router.get("/:id", getById);
router.get("/", authMiddleware, getAllTrips);

module.exports = router;

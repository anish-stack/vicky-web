const express = require("express");
const router = express.Router();
const { createVehicle, updateVehicle, getById, getAll, deleteById } = require("../controllers/vehicleController");
const upload = require("../middlewares/multerConfig");
const admin = require("../middlewares/adminMiddleware");

router.post("/", admin, upload.single("image"), createVehicle);
router.put("/:id", admin, upload.single("image"), updateVehicle);
router.get("/:id", getById);
router.get("/", getAll);
router.delete("/:id", admin, deleteById);

module.exports = router;

const express = require("express");
const router = express.Router();

const controller = require("../controllers/tourHotelController");
const TourPackageUpload = require("../middlewares/tourPackageUpload");
const adminMiddleware = require("../middlewares/adminMiddleware");

// hotel master data - admin only (the website reads hotels through the tour package API)
router.get("/", adminMiddleware, controller.list);
router.get("/:id", adminMiddleware, controller.getOne);
router.post("/", adminMiddleware, TourPackageUpload.any(), controller.create);
router.put("/:id", adminMiddleware, TourPackageUpload.any(), controller.update);
router.delete("/:id", adminMiddleware, controller.remove);

module.exports = router;

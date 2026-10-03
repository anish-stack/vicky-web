const express = require("express");

const router = express.Router();

const controller = require("../controllers/tourPackageController");
const TourPackageUpload = require("../middlewares/tourPackageUpload");
const adminMiddleware = require("../middlewares/adminMiddleware");

// ---------------- public ----------------
router.get("/", controller.getTourPackages);
router.get("/slug/:slug", controller.getTourPackageBySlug);

// ---------------- admin (static paths first) ----------------
router.get("/defaults", adminMiddleware, controller.getDefaults);
router.put("/defaults", adminMiddleware, controller.setDefaults);
router.post("/reorder", adminMiddleware, controller.reorderTourPackages);

router.get("/:id", controller.getTourPackageById);

// auth runs before multer so unauthenticated uploads never touch disk
router.post("/", adminMiddleware, TourPackageUpload.any(), controller.createTourPackage);
router.post("/:id/duplicate", adminMiddleware, controller.duplicateTourPackage);
router.put("/:id", adminMiddleware, TourPackageUpload.any(), controller.updateTourPackage);
router.delete("/:id", adminMiddleware, controller.deleteTourPackage);

module.exports = router;

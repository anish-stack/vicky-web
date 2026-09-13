// routes/driverWashroom.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/DriverWashroom.controller");
const { washroomImageUpload } = require("../middleware/washroomUpload.middleware");
// const { driverAuth, adminAuth } = require("../middleware/auth.middleware");

// ── Driver-facing ──
router.post("/", /* driverAuth, */ washroomImageUpload, ctrl.createWashroom);
router.get("/my-listings", /* driverAuth, */ ctrl.getMyWashrooms);
router.put("/:id", /* driverAuth, */ washroomImageUpload, ctrl.updateWashroom);
router.patch("/:id/toggle-visibility", /* driverAuth, */ ctrl.toggleVisibility);
router.delete("/:id", /* driverAuth, */ ctrl.deleteWashroom);

// ── Public / App-facing (only live listings) ──
router.get("/", ctrl.getPublicWashrooms);
router.get("/:id", ctrl.getOneWashroom);

// ── Admin ──
router.get("/admin/all", /* adminAuth, */ ctrl.adminGetAllWashrooms);
router.patch("/admin/:id/approve", /* adminAuth, */ ctrl.adminApproveWashroom);
router.patch("/admin/:id/reject", /* adminAuth, */ ctrl.adminRejectWashroom);
router.delete("/admin/:id", /* adminAuth, */ ctrl.adminDeleteWashroom);

module.exports = router;
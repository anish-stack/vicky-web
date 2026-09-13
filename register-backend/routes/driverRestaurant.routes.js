// routes/driverRestaurant.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/DriverRestaurant.controller");
const { restaurantImageUpload } = require("../middleware/restaurantUpload.middleware");
// const { driverAuth, adminAuth } = require("../middleware/auth.middleware");

// ── Driver-facing ──
router.post("/", /* driverAuth, */ restaurantImageUpload, ctrl.createRestaurant);
router.get("/my-listings", /* driverAuth, */ ctrl.getMyRestaurants);
router.put("/:id", /* driverAuth, */ restaurantImageUpload, ctrl.updateRestaurant);
router.patch("/:id/toggle-visibility", /* driverAuth, */ ctrl.toggleVisibility);
router.delete("/:id", /* driverAuth, */ ctrl.deleteRestaurant);

// ── Public / App-facing (only live listings) ──
router.get("/", ctrl.getPublicRestaurants);
router.get("/:id", ctrl.getOneRestaurant);

// ── Admin ──
router.get("/admin/all", /* adminAuth, */ ctrl.adminGetAllRestaurants);
router.patch("/admin/:id/approve", /* adminAuth, */ ctrl.adminApproveRestaurant);
router.patch("/admin/:id/reject", /* adminAuth, */ ctrl.adminRejectRestaurant);
router.delete("/admin/:id", /* adminAuth, */ ctrl.adminDeleteRestaurant);

module.exports = router;
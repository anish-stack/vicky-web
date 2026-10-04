const express = require("express");
const router = express.Router();

const controller = require("../controllers/tourCouponController");
const adminMiddleware = require("../middlewares/adminMiddleware");

// coupon master - admin only (customers use /api/tour-booking/coupons + /coupon/validate)
router.get("/", adminMiddleware, controller.list);
router.get("/:id", adminMiddleware, controller.getOne);
router.post("/", adminMiddleware, controller.create);
router.put("/:id", adminMiddleware, controller.update);
router.delete("/:id", adminMiddleware, controller.remove);

module.exports = router;

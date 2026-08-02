const router = require("express").Router();
const c = require("../controllers/payment.controller");
const validate = require("../middleware/validate");
const { requireAuth, optionalAuth } = require("../middleware/auth");

router.post("/create-order", optionalAuth, validate(c.createOrderSchema), c.createOrder);
router.post("/verify", optionalAuth, validate(c.verifySchema), c.verify);
router.post("/failed", optionalAuth, c.recordFailure);

router.get("/", requireAuth, c.list);
router.get("/:id", optionalAuth, c.getOne);

module.exports = router;

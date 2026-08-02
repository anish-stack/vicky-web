const router = require("express").Router();
const c = require("../controllers/trip.controller");
const validate = require("../middleware/validate");
const { requireAuth, optionalAuth, requireRole } = require("../middleware/auth");

// guests can raise an enquiry; the trip is linked on OTP login
router.post("/", optionalAuth, validate(c.createSchema), c.create);

router.get("/", requireAuth, c.list);
router.get("/:id", requireAuth, c.getOne);
router.patch("/:id/cancel", requireAuth, c.cancel);
router.patch("/:id/status", requireAuth, requireRole("superadmin", "admin", "staff"), c.updateStatus);

module.exports = router;

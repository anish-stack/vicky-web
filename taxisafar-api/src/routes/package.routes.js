const router = require("express").Router();
const c = require("../controllers/tourPackage.controller");
const validate = require("../middleware/validate");
const { requireAuth, optionalAuth } = require("../middleware/auth");

/* order matters: static segments before the :slug catch-all */
router.get("/", c.list);
router.get("/slugs", c.slugs);

router.post("/quote", validate(c.quoteSchema), c.quote);
router.post("/book", optionalAuth, validate(c.bookingSchema), c.book);

router.get("/bookings", requireAuth, c.myBookings);
router.get("/bookings/:id", optionalAuth, c.getBooking);

router.get("/:slug", c.detail);
router.get("/:slug/related", c.related);
router.get("/:slug/hotels", c.packageHotels);

module.exports = router;

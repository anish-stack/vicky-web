const router = require("express").Router();
const c = require("../controllers/admin.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("superadmin", "admin", "staff"));

router.get("/stats", c.stats);

/* tour packages — full document, active or not */
router.get("/packages", c.listPackages);
router.get("/packages/:id", c.getPackage);
router.post("/packages", c.packages.create);
router.put("/packages/:id", c.packages.update);
router.delete("/packages/:id", c.packages.remove);

/* package bookings */
router.get("/tour-bookings", c.tourBookings);
router.patch("/tour-bookings/:id", c.updateTourBooking);

/* pricing matrices */
const resource = (path, handlers) => {
  router.get(path, handlers.list);
  router.get(`${path}/:id`, handlers.getOne);
  router.post(path, handlers.create);
  router.put(`${path}/:id`, handlers.update);
  router.delete(`${path}/:id`, handlers.remove);
};

resource("/one-way-pricing", c.oneWaySlabs);
resource("/airport-pricing", c.airportPricing);
resource("/local-rental-pricing", c.localPricing);
resource("/booking-limits", c.bookingLimits);
resource("/pincodes", c.pincodes);
resource("/discounts", c.discounts);
resource("/enquiries", c.enquiries);
resource("/newsletter", c.newsletter);
resource("/users", c.users);

router.get("/advance-payment", c.getAdvance);
router.put("/advance-payment", c.setAdvance);

module.exports = router;
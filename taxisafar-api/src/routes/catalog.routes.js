const router = require("express").Router();
const c = require("../controllers/catalog.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const staff = [requireAuth, requireRole("superadmin", "admin", "staff")];

/** Mounts a public read / protected write resource. */
const resource = (path, handlers, extra = () => {}) => {
  const sub = require("express").Router();
  extra(sub);
  sub.get("/", handlers.list);
  sub.get("/:id", handlers.getOne);
  sub.post("/", staff, handlers.create);
  sub.put("/:id", staff, handlers.update);
  sub.delete("/:id", staff, handlers.remove);
  router.use(path, sub);
};

resource("/cities", c.cities, (sub) => {
  sub.get("/serviceable", c.checkServiceable);
  sub.get("/:id/pincodes", c.cityPincodes);
});
resource("/airports", c.airports);
resource("/vehicles", c.vehicles);
resource("/local-rental-plans", c.localPlans, (sub) => {
  sub.get("/by-city", c.plansByCity);
});
resource("/destinations", c.destinations);
resource("/services", c.services);
resource("/testimonials", c.testimonials);
resource("/faqs", c.faqs);
resource("/hotels", c.hotels);
resource("/dham-categories", c.dhamCategories);
resource("/dham-packages", c.dhamPackages);

module.exports = router;

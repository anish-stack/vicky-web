const router = require("express").Router();
const c = require("../controllers/content.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const staff = [requireAuth, requireRole("superadmin", "admin", "staff")];

router.get("/bootstrap", c.bootstrap);
router.get("/sitemap-data", c.sitemapData);

router.get("/settings", c.listSettings);
router.put("/settings", staff, c.updateSettings);

router.post("/newsletter", c.subscribe);
router.post("/enquiries", c.createEnquiry);

router.get("/content", c.pages.list);
router.get("/content/:page", c.getPage);
router.post("/content", staff, c.pages.create);
router.put("/content/:id", staff, c.pages.update);
router.delete("/content/:id", staff, c.pages.remove);

module.exports = router;

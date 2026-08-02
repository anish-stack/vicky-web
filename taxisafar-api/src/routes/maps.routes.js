const router = require("express").Router();
const c = require("../controllers/maps.controller");
const { mapsLimiter } = require("../middleware/rateLimit");

router.use(mapsLimiter);
router.get("/autocomplete", c.autocomplete);
router.get("/locality", c.locality);
router.get("/pincode", c.pincode);
router.post("/route", c.route);
router.post("/distance-matrix", c.distanceMatrix);

module.exports = router;

const router = require("express").Router();
const c = require("../controllers/quote.controller");

router.get("/settings", c.fareSettings);
router.post("/check-availability", c.checkAvailability);
router.get("/:sessionId", c.getQuote);

module.exports = router;

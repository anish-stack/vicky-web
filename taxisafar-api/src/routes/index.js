const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/sessions", require("./session.routes"));
router.use("/quote", require("./quote.routes"));
router.use("/trips", require("./trip.routes"));
router.use("/packages", require("./package.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/maps", require("./maps.routes"));
router.use("/media", require("./media.routes"));
router.use("/", require("./catalog.routes"));
router.use("/", require("./content.routes"));

module.exports = router;
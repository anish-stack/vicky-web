const router = require("express").Router();
const c = require("../controllers/session.controller");
const validate = require("../middleware/validate");

router.post("/", validate(c.createSchema), c.create);
router.get("/:id", c.getOne);
router.put("/:id", c.update);

module.exports = router;

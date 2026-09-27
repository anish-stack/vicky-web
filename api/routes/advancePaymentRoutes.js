const express = require("express");
const router = express.Router();
const { create, get } = require("../controllers/advancePayment");
const admin = require("../middlewares/adminMiddleware");

router.post("/", admin, create);
router.get("/", get);

module.exports = router;

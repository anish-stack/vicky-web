const express = require("express");
const router = express.Router();
const { createOrUpdate, getFirstRecord } = require("../controllers/discountController");
const admin = require("../middlewares/adminMiddleware");

router.post("/", admin, createOrUpdate);
router.get("/", getFirstRecord);

module.exports = router;

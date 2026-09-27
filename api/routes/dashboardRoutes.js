const express = require("express");
const router = express.Router();
const { stats } = require("../controllers/dashboardController");
const admin = require("../middlewares/adminMiddleware");

router.get("/", admin, stats);

module.exports = router;

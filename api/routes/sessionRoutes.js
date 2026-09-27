const express = require("express");
const router = express.Router();
const { createSession, getSessionById, updateSession, getAll } = require("../controllers/sessionController");
const admin = require("../middlewares/adminMiddleware");

router.post("/", createSession);
router.get("/:id", getSessionById);
router.put("/:id", updateSession);
router.get("/", admin, getAll);

module.exports = router;

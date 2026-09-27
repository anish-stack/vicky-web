const express = require("express");
const router = express.Router();
const { create, update, getAll, getById, deleteById } = require("../controllers/airPortController");
const admin = require("../middlewares/adminMiddleware");

router.post("/", admin, create);
router.put("/:id", admin, update);
router.get("/:id", getById);
router.get("/", getAll);
router.delete("/:id", admin, deleteById);

module.exports = router;

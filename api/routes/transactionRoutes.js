const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getById,
  generatePDF,
  completeTransaction,
} = require("../controllers/transcationController");
const authMiddleware = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");

router.post("/", authMiddleware, createTransaction);
router.get("/pdf/:id", generatePDF);
router.get("/:id", getById);
// customers only see their own rows (scoped inside the controller)
router.get("/", authMiddleware, getAllTransactions);
router.put("/:id", admin, completeTransaction);

module.exports = router;

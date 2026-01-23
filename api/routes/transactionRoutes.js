const express = require("express");
const router = express.Router();
const {
	createTransaction,
	getAllTransactions,
	getById,
	generatePDF,
	completeTransaction,
} = require("../controllers/transcationController");
// const upload = require("../middlewares/multerConfig");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", createTransaction);

// router.get('/:id', authMiddleware, getById);
router.get("/pdf/:id", generatePDF);
router.get("/:id", getById);

// router.put('/:id', updateSession);
router.get("/", authMiddleware, getAllTransactions);
router.put('/:id',authMiddleware, completeTransaction);


module.exports = router;

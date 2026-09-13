const express = require("express");

const router = express.Router();

const {
    createFee,
    getFees,
    getFeeById,
    getFeeByKey,
    updateFee,
    deleteFee,
} = require("../controllers/feeController");

// Create
router.post("/", createFee);

// Get all
router.get("/", getFees);

// Get by key
router.get("/key/:key", getFeeByKey);

// Get by ID
router.get("/:id", getFeeById);

// Update
router.put("/:id", updateFee);

// Delete
router.delete("/:id", deleteFee);

module.exports = router;

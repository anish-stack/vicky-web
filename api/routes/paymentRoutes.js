const express = require("express");
const {
	createOrder,
	getPaymentDetails,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/get-payment-details", getPaymentDetails);

module.exports = router;
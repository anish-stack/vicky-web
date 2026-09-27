const Razorpay = require("razorpay");
require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const razorpay = new Razorpay({
    key_id: isProd
        ? process.env.RAZORPAY_LIVE_KEY_ID
        : process.env.RAZORPAY_TEST_KEY_ID,
    key_secret: isProd
        ? process.env.RAZORPAY_LIVE_KEY_SECRET
        : process.env.RAZORPAY_TEST_KEY_SECRET,
});

// POST /api/payment/create-order
exports.createOrder = async (req, res) => {
    const { amount, userId, userName } = req.body;

    if (!amount || typeof amount !== "number") {
        return res.status(400).json({
            success: false,
            error: "Invalid amount",
        });
    }

    try {
        console.log("==================================");
        console.log("🚀 Create Order API Hit");
        console.log("Environment :", isProd ? "LIVE" : "TEST");
        console.log(
            "Razorpay Key :",
            isProd
                ? process.env.RAZORPAY_LIVE_KEY_ID
                : process.env.RAZORPAY_TEST_KEY_ID
        );
        console.log("Amount :", amount);
        console.log("User :", userId, userName);
        console.log("==================================");

        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            payment_capture: 1,
            notes: {
                userId: userId || "unknown",
                userName: userName || "not_provided",
            },
        });

        console.log("✅ Order Created:", order.id);
        return res.status(200).json({
            success: true,
            data: {
                ...order,
                key: isProd
                    ? process.env.RAZORPAY_LIVE_KEY_ID
                    : process.env.RAZORPAY_TEST_KEY_ID,
            },
        });
    } catch (error) {
        console.error("❌ Razorpay Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error?.error?.description || error?.message,
        });
    }
};
// POST /api/payment/get-payment-details
exports.getPaymentDetails = async (req, res) => {
    const { payment_id } = req.body;

    if (!payment_id) {
        return res.status(400).json({ error: "Payment ID is required" });
    }

    try {
        const paymentDetails = await razorpay.payments.fetch(payment_id);
        return res.status(200).json(paymentDetails);
    } catch (error) {
        return res
            .status(error?.statusCode || 500)
            .json({ error: error?.error || "Failed to fetch payment details" });
    }
};
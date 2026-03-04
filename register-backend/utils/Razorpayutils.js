const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentLink = async ({ amount, userId, name, phone, email, description }) => {
    const payload = {
        amount: amount * 100, 
        currency: "INR",
        accept_partial: false,
        description: description || "TaxiSafar Profile Activation",
        customer: {
            name,
            contact: `+91${phone}`,
            email
        },
        notify: {
            sms: true,
            email: true,
            whatsapp: false 
        },
        reminder_enable: true,
        notes: {
            userId: String(userId),
            platform: "TaxiSafar"
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/success`,
        callback_method: "get",
        expire_by: Math.floor(Date.now() / 1000) + 24 * 60 * 60, 
    };

    const paymentLink = await razorpay.paymentLink.create(payload);
    return paymentLink;
};

exports.fetchPaymentLink = async (paymentLinkId) => {
    return await razorpay.paymentLink.fetch(paymentLinkId);
};

exports.verifyWebhookSignature = (rawBody, signature) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
    return expectedSignature === signature;
};

module.exports.razorpay = razorpay;
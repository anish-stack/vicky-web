require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const ONE_HOUR_IN_SECONDS = 60 * 60;

/**
 * Creates a Razorpay Payment Link valid for exactly 1 hour.
 * amountInRupees -> converted to paise internally (Razorpay expects paise).
 */
exports.createSecurityDepositPaymentLink = async ({
    amountInRupees,
    customerName,
    customerPhone,
    referenceId, // bookingId, so we can map the webhook back to a booking
    description = "Tour Guide Security Deposit"
}) => {
    const expireBy = Math.floor(Date.now() / 1000) + ONE_HOUR_IN_SECONDS;

    const paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(amountInRupees * 100),
        currency: "INR",
        accept_partial: false,
        description,
        customer: {
            name: customerName,
            contact: customerPhone
        },
        notify: {
            sms: false,
            email: false // we notify via our own WhatsApp template instead
        },
        reference_id: referenceId,
        expire_by: expireBy,
        notes: {
            bookingId: referenceId
        }
    });

    return {
        id: paymentLink.id,
        shortUrl: paymentLink.short_url,
        expiresAt: new Date(expireBy * 1000)
    };
};

/**
 * Cancels ("invalidates") an active payment link so it can no longer be paid.
 */
exports.invalidatePaymentLink = async (paymentLinkId) => {
    const cancelled = await razorpay.paymentLink.cancel(paymentLinkId);
    return cancelled;
};

exports.fetchPaymentLink = async (paymentLinkId) => {
    return razorpay.paymentLink.fetch(paymentLinkId);
};

/**
 * Verifies the X-Razorpay-Signature header on incoming webhooks.
 * rawBody must be the raw (unparsed) request body string/buffer.
 */
exports.verifyWebhookSignature = (rawBody, signature) => {
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    return expected === signature;
};

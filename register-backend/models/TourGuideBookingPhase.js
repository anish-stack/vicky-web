const mongoose = require("mongoose");


const tourGuideBookingPhaseSchema = new mongoose.Schema({

    driver_who_booked: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    secuirity_deposit: {
        type: Number,
        required: true
    },

    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "security_deposit_paid", "security_deposit_failed", "booking_confirmed", "booking_failed", "request_cancelled", "request_sent"],
        default: "pending"
    },

    whatsappMessageSent: {
        type: Boolean,
        default: false
    },

    // ---- Payment link tracking (Razorpay Payment Links) ----

    paymentLinkId: {
        type: String,
        default: null
    },

    paymentLinkUrl: {
        type: String,
        default: null
    },

    paymentLinkStatus: {
        type: String,
        enum: ["not_generated", "active", "paid", "expired", "invalidated"],
        default: "not_generated"
    },

    paymentLinkExpiresAt: {
        type: Date,
        default: null
    },

    // Razorpay's payment id, once the link is actually paid
    paymentId: {
        type: String,
        default: null
    },

    paidAt: {
        type: Date,
        default: null
    },

    whatsappPaymentLinkMessageSent: {
        type: Boolean,
        default: false
    },

    whatsappPaymentSuccessMessageSent: {
        type: Boolean,
        default: false
    }


}, { timestamps: true });

module.exports = mongoose.model("TourGuideBookingPhase", tourGuideBookingPhaseSchema);
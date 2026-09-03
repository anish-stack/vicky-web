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
    }


}, { timestamps: true });

module.exports = mongoose.model("TourGuideBookingPhase", tourGuideBookingPhaseSchema);
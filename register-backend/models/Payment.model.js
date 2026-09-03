const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        rzp_order_id: {
            type: String
        },

        paymentId: {
            type: String
        },

        amountPaid: {
            type: Number
        },

        amountPaidValidUpto: {
            type: Date
        },

        paymentLink: {
            type: String
        },

        paymentLinkExpired: {
            type: Boolean,
            default: false
        },

        paymentLinkSendOrNot: {
            type: Boolean,
            default: false
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        }

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Payment", paymentSchema);
const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * RtoContactRequest
 * Har baar jab koi user RTO agent ke "Call" ya "WhatsApp" button pe click
 * karta hai, ek record yahan save hota hai — tracking/analytics ke liye
 * (kitne log kis agent ko contact kar rahe hain, kis mode se, kab).
 */
const rtoContactRequestSchema = new Schema(
    {
        // Jis RTO agent ko contact kiya gaya
        agent: {
            type: Schema.Types.ObjectId,
            ref: "User", // apne actual agent model ka naam yahan use karo
            required: true,
            index: true,
        },

        // Jis user ne contact request ki (agar login required hai)
        user: {
            type: Schema.Types.ObjectId,
            default: null,
            index: true,
        },

        // Contact kis mode se hui
        type: {
            type: String,
            enum: ["call", "whatsapp"],
            required: true,
        },

        // Us waqt jo number use hua (snapshot rakhna acha hai,
        // kyunki agent apna number baad me change kar sakta hai)
        contactNumber: {
            type: String,
            trim: true,
        },

        // Agar user login nahi hai, guest info capture karne ke liye (optional)
        guestName: {
            type: String,
            trim: true,
            default: null,
        },
        guestPhone: {
            type: String,
            trim: true,
            default: null,
        },

        // Kaha se request aayi (app screen/source tracking, optional)
        source: {
            type: String,
            default: "rto_agent_details",
        },

        status: {
            type: String,
            enum: ["pending", "in_progress", "contacted", "closed"],
            default: "pending",
        },
    },
    { timestamps: true } // createdAt = requestedAt, updatedAt automatically
);

// Fast lookup: ek agent ki saari requests, latest pehle
rtoContactRequestSchema.index({ agent: 1, createdAt: -1 });

module.exports = mongoose.model("RtoContactRequest", rtoContactRequestSchema);

const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [100, "Name is too long"],
      index: true
    },

    number: {
      type: String,
      required: [true, "Please enter your phone number"],
      trim: true,
      match: [
        /^[0-9]{10,15}$/,
        "Please enter a valid phone number"
      ],
      index: true
    },

    message: {
      type: String,
      required: [true, "Please write a short message"],
      trim: true,
      maxlength: [1000, "Message is too long"]
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    WhatsAppNotificationSend: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);


// Fast queries for provider leads
ContactSchema.index({ providerId: 1, createdAt: -1 });

// Prevent duplicate leads quickly (optional but recommended)
ContactSchema.index({ number: 1, providerId: 1, createdAt: -1 });

module.exports = mongoose.model("Contact", ContactSchema);
// models/MechanicContactLog.model.js
const mongoose = require("mongoose");

const mechanicContactLogSchema = new mongoose.Schema({
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: "CarMechanicUser", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userPhone: { type: String, trim: true },

  type: { type: String, enum: ["call", "whatsapp"], required: true },

  status: { type: String, enum: ["initiated", "failed"], default: "initiated" },
  meta: {
    platform: { type: String }, // android/ios/web
    appVersion: { type: String }
  }

}, { timestamps: true });

mechanicContactLogSchema.index({ mechanicId: 1, createdAt: -1 });

module.exports = mongoose.model("MechanicContactLog", mechanicContactLogSchema);
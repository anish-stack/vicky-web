const { Schema, model } = require("mongoose");
const { baseOptions } = require("./_base");

const otpSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["login", "register", "booking", "verify"], default: "login" },
    tripRef: { type: Schema.Types.ObjectId, ref: "Trip", default: null },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  baseOptions
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("Otp", otpSchema);

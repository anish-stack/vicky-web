const { Schema, model } = require("mongoose");
const { baseOptions } = require("./_base");

const schema = new Schema(
  {
    city: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    pincode: { type: String, required: true, index: true },
    areaName: { type: String, default: null },
    isValid: { type: Boolean, default: true },
  },
  { ...baseOptions, suppressReservedKeysWarning: true }
);

schema.index({ city: 1, pincode: 1 }, { unique: true });

module.exports = model("Pincode", schema);

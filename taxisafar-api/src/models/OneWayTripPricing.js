const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    from: { type: Number, required: true },
    to: { type: Number, required: true },
    price_per_km: { type: Number, required: true },
    ...auditFields,
  },
  baseOptions
);

schema.index({ vehicle: 1, from: 1, to: 1 });

module.exports = model("OneWayTripPricing", schema);

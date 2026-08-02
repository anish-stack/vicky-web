const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  {
    airport: { type: Schema.Types.ObjectId, ref: "Airport", required: true, index: true },
    city: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    price: { type: Number, required: true },
    ...auditFields,
  },
  baseOptions
);

schema.index({ airport: 1, city: 1, vehicle: 1 }, { unique: true });

module.exports = model("AirportPricing", schema);

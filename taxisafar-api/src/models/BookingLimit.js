const { Schema, model } = require("mongoose");
const { baseOptions } = require("./_base");

const schema = new Schema(
  {
    city: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    limitDate: { type: Date, default: null }, // null => city+vehicle fallback rule
    maxLimit: { type: Number, required: true },
  },
  baseOptions
);

schema.index({ city: 1, vehicle: 1, limitDate: 1 }, { unique: true });

module.exports = model("BookingLimit", schema);

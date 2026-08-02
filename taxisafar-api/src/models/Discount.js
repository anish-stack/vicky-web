const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

/** discount_vehicles rows, embedded under a city rule */
const discountVehicleSchema = new Schema(
  {
    tripType: { type: String, enum: ["oneWay", "roundTrip", "local", "airport"], required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    discount: { type: Number, default: 0 },
  },
  { _id: false }
);

/** discount_cities + discount_trip_types, embedded */
const discountCitySchema = new Schema(
  {
    city: { type: Schema.Types.ObjectId, ref: "City", default: null },
    pickupCityName: { type: String, default: null },
    pickupCityPlaceId: { type: String, default: null, index: true },
    dropCityName: { type: String, default: null },
    dropCityPlaceId: { type: String, default: null, index: true },
    isBidirectional: { type: Boolean, default: false },
    tripTypes: { type: [String], default: [] },
    vehicles: { type: [discountVehicleSchema], default: [] },
  },
  { _id: true }
);

const discountSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    overall_discount: { type: Number, default: 0 },
    apply_overall_discount: { type: Boolean, default: false },
    apply_citywise_discount: { type: Boolean, default: false },
    validFrom: { type: Date, default: null },
    validTo: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true },
    cities: { type: [discountCitySchema], default: [] },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Discount", discountSchema);

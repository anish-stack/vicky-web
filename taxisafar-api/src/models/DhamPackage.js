const { Schema, model } = require("mongoose");
const { baseOptions, auditFields, seoSchema } = require("./_base");

/** dham_pricings — per pickup city + vehicle */
const dhamPricingSchema = new Schema(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
  },
  { _id: false }
);

/** dham_stops — itinerary stops under a pickup city */
const dhamStopSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    day: { type: Number, default: null },
    distance: { type: String, default: null },
    duration: { type: String, default: null },
  },
  { _id: false }
);

/** dham_pickup_cities */
const dhamPickupCitySchema = new Schema(
  {
    name: { type: String, required: true },
    days: { type: Number, required: true },
    pricings: { type: [dhamPricingSchema], default: [] },
    stops: { type: [dhamStopSchema], default: [] },
  },
  { _id: true }
);

/** dham_package_routes */
const dhamRouteSchema = new Schema(
  {
    place_name: { type: String, required: true },
    place_id: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const dhamPackageSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: null },
    gallery: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "DhamCategory", required: true, index: true },
    distance: { type: String, default: null },
    description: { type: String, default: "" },
    routes: { type: [dhamRouteSchema], default: [] },
    pickupCities: { type: [dhamPickupCitySchema], default: [] },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("DhamPackage", dhamPackageSchema);

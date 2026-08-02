const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

/**
 * Field names intentionally mirror the legacy MySQL `vehicles` table so the
 * pricing formula stays byte-for-byte identical to the current live logic.
 */
const vehicleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: null },

    // --- pricing inputs (do not rename: pricing service depends on these) ---
    priceperkm: { type: Number, default: 0 },              // round trip fixed rate/km
    fuelcharges: { type: String, default: "Included" },
    drivercharges: { type: String, default: "Included" },
    parkingcharges: { type: String, default: "Not Include" },
    nightcharges: { type: String, default: "Included" },
    minimum_price: { type: Number, default: 0 },           // one-way floor price
    minimum_price_range: { type: Number, default: 0 },     // km under which floor applies
    extra_fare_km: { type: Number, default: 0 },
    additional_time_charge: { type: Number, default: 0 },
    driver_expences: { type: Number, default: 0 },         // legacy spelling kept
    perdaystatetaxcharges: { type: Number, default: 0 },

    // --- display ---
    ac_cab: { type: Boolean, default: true },
    luggage: { type: String, default: null },
    terms: { type: String, default: null },
    passengers: { type: Number, default: 4 },
    large_size_bag: { type: Number, default: 0 },
    medium_size_bag: { type: Number, default: 0 },
    hand_bag: { type: Number, default: 0 },

    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    ...auditFields,
  },
  baseOptions
);

vehicleSchema.virtual("one_way_trip_pricings", {
  ref: "OneWayTripPricing", localField: "_id", foreignField: "vehicle",
});
vehicleSchema.virtual("airport_pricings", {
  ref: "AirportPricing", localField: "_id", foreignField: "vehicle",
});
vehicleSchema.virtual("local_rental_pricings", {
  ref: "LocalRentalPricing", localField: "_id", foreignField: "vehicle",
});

module.exports = model("Vehicle", vehicleSchema);

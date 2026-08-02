const { Schema, model } = require("mongoose");
const { baseOptions } = require("./_base");

/** A place picked in the search form (google place_id + label) */
const placeSchema = new Schema(
  { label: String, value: String, order: { type: Number, default: 0 } },
  { _id: false }
);

/**
 * A search session created from the home-page booking widget.
 * Mirrors the legacy `sessions` table 1:1 so the quote/price screen keeps working.
 */
const sessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },

    car_tab: { type: String, enum: ["taxi", "chardham", "hotel"], required: true },
    tripType: { type: String, enum: ["oneWay", "roundTrip", "local", "airport", null], default: null },
    category: { type: String, enum: ["outstation", "localairport", null], default: null },

    distance: { type: Number, default: null },
    phoneNo: { type: String, required: true },
    pickUpDate: { type: Date, default: null },
    dropDate: { type: Date, default: null },
    places: { type: [placeSchema], default: [] },

    pincode: { type: String, default: null },
    city: { type: Schema.Types.ObjectId, ref: "City", default: null },
    discountSlug: { type: String, default: null },

    // local / airport
    localRentalPlan: { type: Schema.Types.ObjectId, ref: "LocalRentalPlan", default: null },
    time: { type: Number, default: null },
    airport: { type: Schema.Types.ObjectId, ref: "Airport", default: null },
    airportCity: { type: Schema.Types.ObjectId, ref: "City", default: null },
    airportFromTo: { type: String, enum: ["from", "to", null], default: null },

    // hotel
    hotelCity: { type: Schema.Types.ObjectId, ref: "City", default: null },
    check_in: { type: Date, default: null },
    check_out: { type: Date, default: null },
    adult: { type: Number, default: null },
    children: { type: Number, default: null },
    rooms: { type: Number, default: null },
    children_ages: { type: [Number], default: [] },

    // char dham
    dhamCategory: { type: Schema.Types.ObjectId, ref: "DhamCategory", default: null },
    dhamPackage: { type: Schema.Types.ObjectId, ref: "DhamPackage", default: null },
    dhamPickupCityId: { type: Schema.Types.ObjectId, default: null },
    dhamPackageDays: { type: Number, default: null },

    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  },
  baseOptions
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("Session", sessionSchema);

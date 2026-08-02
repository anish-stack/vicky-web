const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const placeSchema = new Schema(
  { label: String, value: String, order: { type: Number, default: 0 } },
  { _id: false }
);

const TRIP_STATUS = ["pending", "confirmed", "ongoing", "completed", "cancelled"];

/** An enquiry / booking created from the quote screen. */
const tripSchema = new Schema(
  {
    tripCode: { type: String, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
    session: { type: Schema.Types.ObjectId, ref: "Session", default: null },

    pickupAddress: { type: String, default: null },
    pincode: { type: String, default: null },
    places: { type: [placeSchema], default: [] },

    departureDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },
    distance: { type: Number, default: null },

    trip_type: { type: String, default: null },     // oneWay | roundTrip | local | airport
    category: { type: String, default: null },      // outstation | localairport
    car_tab: { type: String, default: null },       // taxi | chardham | hotel

    // frozen price breakdown at time of quote
    quotedPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    includedKm: { type: String, default: null },
    extra_km: { type: Number, default: 0 },
    toll_tax: { type: String, default: "Not Include" },
    parking_charges: { type: String, default: "Not Include" },
    driver_charges: { type: String, default: "Included" },
    night_charges: { type: String, default: "Included" },
    fuel_charges: { type: String, default: "Included" },
    taxInclusive: { type: Boolean, default: false },

    city: { type: Schema.Types.ObjectId, ref: "City", default: null },
    localRentalPlan: { type: Schema.Types.ObjectId, ref: "LocalRentalPlan", default: null },
    airport: { type: Schema.Types.ObjectId, ref: "Airport", default: null },
    airportCity: { type: Schema.Types.ObjectId, ref: "City", default: null },
    airportFromTo: { type: String, default: null },

    dhamCategory: { type: Schema.Types.ObjectId, ref: "DhamCategory", default: null },
    dhamCategoryName: { type: String, default: null },
    dhamPackage: { type: Schema.Types.ObjectId, ref: "DhamPackage", default: null },
    dhamPackageName: { type: String, default: null },
    dhamPickupCityId: { type: Schema.Types.ObjectId, default: null },
    dhamPickupCityName: { type: String, default: null },
    dhamPackageDays: { type: Number, default: null },

    customerName: { type: String, default: null },
    customerPhone: { type: String, required: true, index: true },
    customerEmail: { type: String, default: null },

    trip_status: { type: String, enum: TRIP_STATUS, default: "pending", index: true },
    isConvertedPost: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
    completedAt: { type: Date, default: null },
    ...auditFields,
  },
  baseOptions
);

tripSchema.pre("save", function (next) {
  if (!this.tripCode) {
    const d = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    this.tripCode = `TRP-${d}-${Math.floor(Math.random() * 90000 + 10000)}`;
  }
  next();
});

module.exports = model("Trip", tripSchema);
module.exports.TRIP_STATUS = TRIP_STATUS;

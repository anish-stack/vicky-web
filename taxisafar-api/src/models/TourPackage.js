const { Schema, model } = require("mongoose");
const { baseOptions, auditFields, seoSchema } = require("./_base");

/** Icon + label chip row shown on the tour card ("Hotel Option / Include Not", etc.) */
const highlightSchema = new Schema(
  { icon: { type: String, default: "calendar" }, title: String, subtitle: { type: String, default: "" } },
  { _id: false }
);

/** One bullet inside a day of the itinerary */
const itineraryItemSchema = new Schema(
  { title: { type: String, required: true }, description: { type: String, default: "" } },
  { _id: false }
);

const itineraryDaySchema = new Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },      // "Day 1 - Delhi to Mathura - Vrindavan"
    distance: { type: String, default: null },    // "230 Kms"
    duration: { type: String, default: null },    // "6-7hrs"
    summary: { type: String, default: "" },
    items: { type: [itineraryItemSchema], default: [] },
    image: { type: String, default: null },
  },
  { _id: false }
);

/** "Places We Cover" grid */
const placeSchema = new Schema(
  { name: { type: String, required: true }, icon: { type: String, default: "temple" }, image: { type: String, default: null } },
  { _id: false }
);

const faqSchema = new Schema(
  { question: { type: String, required: true }, answer: { type: String, required: true } },
  { _id: false }
);

/** "Select Your Vehicle" — per-package fixed all-inclusive price */
const vehicleOptionSchema = new Schema(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
    label: { type: String, required: true },        // Hatchback / Sedan / SUV / Prime SUV
    image: { type: String, default: null },
    seats: { type: String, default: "4+1 Seats" },
    suitcases: { type: String, default: "2 Suitcases" },
    ac: { type: Boolean, default: true },
    price: { type: Number, required: true },        // all-inclusive cab charge
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

/** "Select Your Hotel" — hotel choices attached to this package */
const hotelOptionSchema = new Schema(
  {
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    priceOverride: { type: Number, default: null },  // null => use hotel.pricePerNight
    nights: { type: Number, default: 1 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const tourPackageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },        // "New Delhi to Mathura Vrindavan UP"
    slug: { type: String, required: true, unique: true, index: true },
    fromCityName: { type: String, required: true },
    toCityName: { type: String, required: true },
    fromCity: { type: Schema.Types.ObjectId, ref: "City", default: null, index: true },

    coverImage: { type: String, default: null },
    gallery: { type: [String], default: [] },

    days: { type: Number, required: true },
    nights: { type: Number, required: true },
    durationLabel: { type: String, default: null },             // "2 Days / 1 Night Tour"
    tripType: { type: String, enum: ["roundTrip", "oneWay"], default: "roundTrip" },

    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    highlights: { type: [highlightSchema], default: [] },
    hotelOptional: { type: Boolean, default: true },

    itinerary: { type: [itineraryDaySchema], default: [] },
    placesCovered: { type: [placeSchema], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    importantNotes: { type: [String], default: [] },
    faqs: { type: [faqSchema], default: [] },

    vehicleOptions: { type: [vehicleOptionSchema], default: [] },
    hotelOptions: { type: [hotelOptionSchema], default: [] },

    /** cab booking charge collected online, as % of cab charge (10% in the reference design) */
    bookingChargePercent: { type: Number, default: 10 },

    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
    ...auditFields,
  },
  baseOptions
);

tourPackageSchema.index({ title: "text", fromCityName: "text", toCityName: "text" });

/** Lowest all-inclusive cab price — drives the "Taxi Charge ₹14,999" card label */
tourPackageSchema.virtual("startingPrice").get(function () {
  const active = (this.vehicleOptions || []).filter((v) => v.isActive);
  if (!active.length) return 0;
  return Math.min(...active.map((v) => v.price));
});

tourPackageSchema.pre("save", function (next) {
  if (!this.durationLabel) this.durationLabel = `${this.days} Days / ${this.nights} Night Tour`;
  next();
});

module.exports = model("TourPackage", tourPackageSchema);

// models/DriverRestaurant.model.js
const mongoose = require("mongoose");

const FACILITY_LIST = [
  "Parking",
  "Washroom",
  "AC",
  "Family Hall",
  "Pure Veg",
  "Non-Veg",
  "Outdoor Seating",
  "Card Payment",
  "UPI Accepted",
];

const driverRestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    // "Food for Only Taxi Drivers"
    foodType: {
      type: String,
      enum: ["free", "discount_paid"],
      required: true,
    },

    // "Customer Allowed?"
    customerAllowed: {
      type: String,
      enum: ["customers_allowed", "only_drivers"],
      required: true,
    },

    description: { type: String, required: true, trim: true, maxlength: 500 },
    contactNumber: { type: String, required: true, trim: true },

    timings: {
      openTime: { type: String, required: true }, // "06:00"
      closeTime: { type: String, required: true }, // "23:00"
    },

    facilities: {
      type: [{ type: String, enum: FACILITY_LIST }],
      default: [],
    },

    photos: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 3 && arr.length <= 5,
        message: "Upload between 3 and 5 photos",
      },
      required: true,
    },

    googleMapLink: { type: String, required: true, trim: true },

    confirmedByDriver: { type: Boolean, default: false },

    // ── Driver who submitted ──
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // ── Admin approval workflow ──
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    reviewedAt: { type: Date },

    isVisibleToggle: { type: Boolean, default: true },
    isLive: { type: Boolean, default: false }, // approved && visible

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

driverRestaurantSchema.index({ location: "2dsphere" });
driverRestaurantSchema.index({ name: "text", address: "text" });

driverRestaurantSchema.pre("save", function () {
  this.isLive = this.status === "approved" && this.isVisibleToggle;
});

driverRestaurantSchema.statics.FACILITY_LIST = FACILITY_LIST;

module.exports = mongoose.model("DriverRestaurant", driverRestaurantSchema);
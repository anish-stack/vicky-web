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
const contactSchema = new mongoose.Schema({
  role: { type: String, required: true, trim: true, maxlength: 40 }, // Manager / Supervisor / Waiter / Employee
  name: { type: String, trim: true, default: "", maxlength: 60 }, // actual person name (optional)
  number: { type: String, required: true, trim: true },
});
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
    contactNumber: { type: String, trim: true, default: "" }, // mirror of contacts[0].number
    contacts: {
      type: [contactSchema],
      default: [],
      validate: {
        validator: (a) => a.length <= 4,
        message: "Max 4 contacts allowed",
      },
    },

    timings: {
      openTime: {
        type: String,
        required: function () {
          return !this.is24Hours;
        },
      },
      closeTime: {
        type: String,
        required: function () {
          return !this.is24Hours;
        },
      },
    },

    is24Hours: {
      type: Boolean,
      default: false,
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
  { timestamps: true },
);

driverRestaurantSchema.index({ location: "2dsphere" });
driverRestaurantSchema.index({ name: "text", address: "text" });

driverRestaurantSchema.pre("save", function () {
  this.isLive = this.status === "approved" && this.isVisibleToggle;
});
driverRestaurantSchema.pre("validate", function () {
  if (this.contacts?.length) this.contactNumber = this.contacts[0].number;
  if (!this.contactNumber)
    this.invalidate("contacts", "At least one contact is required");
});
driverRestaurantSchema.statics.FACILITY_LIST = FACILITY_LIST;

module.exports = mongoose.model("DriverRestaurant", driverRestaurantSchema);

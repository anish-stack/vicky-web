// models/DriverWashroom.model.js
const mongoose = require("mongoose");

const FACILITY_LIST = [
  "Water",
  "Soap",
  "Clean",
  "Parking",
  "24x7",
  "Bathing Area",
  "Toilet (Indian)",
  "Toilet (Western)",
  "Changing Room",
  "Lighting",
  "Security",
  "Hand Wash",
  "Other",
];

const driverWashroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    googleMapLink: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    description: { type: String, required: true, trim: true },

    photos: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 3 && arr.length <= 5,
        message: "Upload between 3 and 5 photos",
      },
      required: true,
    },

    facilities: {
      type: [{ type: String, enum: FACILITY_LIST }],
      default: [],
    },

    isVisibleToggle: { type: Boolean, default: true }, // driver's own toggle at submit time

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

    // computed: only true when admin-approved AND driver still wants it visible
    isLive: { type: Boolean, default: false },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

driverWashroomSchema.index({ location: "2dsphere" });
driverWashroomSchema.index({ name: "text", address: "text" });

// keep isLive in sync automatically
driverWashroomSchema.pre("save", function () {
  this.isLive = this.status === "approved" && this.isVisibleToggle;

});

driverWashroomSchema.statics.FACILITY_LIST = FACILITY_LIST;

module.exports = mongoose.model("DriverWashroom", driverWashroomSchema);
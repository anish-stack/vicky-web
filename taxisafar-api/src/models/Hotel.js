const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const hotelSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: null },
    gallery: { type: [String], default: [] },
    city: { type: Schema.Types.ObjectId, ref: "City", default: null, index: true },
    cityName: { type: String, default: null },
    roomType: { type: String, default: "Deluxe Room" },
    starRating: { type: Number, default: 3 },
    checkInTime: { type: String, default: "12:00 PM" },
    checkOutTime: { type: String, default: "11:00 AM" },
    pricePerNight: { type: Number, required: true },
    maxAdults: { type: Number, default: 2 },
    maxChildren: { type: Number, default: 1 },
    amenities: { type: [String], default: [] },
    address: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Hotel", hotelSchema);

const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

/** Booking created from the tour-package flow (Packages page -> Booking Details). */
const tourBookingSchema = new Schema(
  {
    bookingCode: { type: String, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    package: { type: Schema.Types.ObjectId, ref: "TourPackage", required: true, index: true },
    packageTitle: { type: String, required: true },
    packageSlug: { type: String, required: true },
    durationLabel: { type: String, default: null },
    tripType: { type: String, default: "roundTrip" },

    vehicleOptionId: { type: Schema.Types.ObjectId, required: true },
    vehicleLabel: { type: String, required: true },
    vehicleImage: { type: String, default: null },
    cabCharge: { type: Number, required: true },

    hotelOptionId: { type: Schema.Types.ObjectId, default: null },
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", default: null },
    hotelName: { type: String, default: null },
    hotelRoomType: { type: String, default: null },
    hotelNights: { type: Number, default: 0 },
    rooms: { type: Number, default: 0 },
    hotelCharge: { type: Number, default: 0 },
    hotelRequired: { type: Boolean, default: false },

    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 },

    pickupLocation: { type: String, required: true },
    pickupAddress: { type: String, default: null },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },

    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, index: true },
    email: { type: String, default: null },

    totalPayable: { type: Number, required: true },
    bookingChargePercent: { type: Number, default: 10 },
    bookingChargeAmount: { type: Number, required: true },
    balanceDue: { type: Number, default: 0 },

    termsAccepted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction", default: null },
    ...auditFields,
  },
  baseOptions
);

tourBookingSchema.pre("save", function (next) {
  if (!this.bookingCode) {
    const d = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    this.bookingCode = `TB-${d}-${Math.floor(Math.random() * 90000 + 10000)}`;
  }
  next();
});

module.exports = model("TourBooking", tourBookingSchema);

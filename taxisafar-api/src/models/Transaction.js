const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const transactionSchema = new Schema(
  {
    invoiceId: { type: String, unique: true, index: true },
    orderId: { type: String, index: true },              // razorpay order_id
    paymentId: { type: String, default: null, index: true },
    signature: { type: String, default: null },

    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    trip: { type: Schema.Types.ObjectId, ref: "Trip", default: null, index: true },
    tourBooking: { type: Schema.Types.ObjectId, ref: "TourBooking", default: null, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },

    name: { type: String, default: null },
    email: { type: String, default: null },
    contact: { type: String, default: null, index: true },
    pickupAddress: { type: String, default: null },
    vehicleName: { type: String, default: null },

    originalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded", "pending"],
      default: "created",
      index: true,
    },

    method: { type: String, default: null },
    card: { type: Schema.Types.Mixed, default: null },
    upi: { type: Schema.Types.Mixed, default: null },
    bank: { type: String, default: null },
    wallet: { type: String, default: null },
    acquirerData: { type: Schema.Types.Mixed, default: null },
    allDetails: { type: Schema.Types.Mixed, default: null },

    errorDescription: { type: String, default: null },
    errorReason: { type: String, default: null },

    // frozen trip snapshot for invoice generation
    extraKm: { type: Number, default: 0 },
    additionalKilometers: { type: Number, default: 0 },
    additionalTime: { type: Number, default: 0 },
    additionalTimeCharge: { type: Number, default: 0 },
    tollTax: { type: String, default: null },
    parkingCharges: { type: String, default: null },
    driverCharges: { type: String, default: null },
    nightCharges: { type: String, default: null },
    fuelCharges: { type: String, default: null },
    places: { type: Schema.Types.Mixed, default: null },
    departureDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },
    distance: { type: Number, default: null },
    tripType: { type: String, default: null },
    category: { type: String, default: null },
    carTab: { type: String, default: null },
    ...auditFields,
  },
  baseOptions
);

transactionSchema.pre("save", function (next) {
  if (!this.invoiceId) {
    const d = new Date();
    const y = d.getFullYear();
    this.invoiceId = `INV-${y}-${Math.floor(Math.random() * 900000 + 100000)}`;
  }
  next();
});

module.exports = model("Transaction", transactionSchema);

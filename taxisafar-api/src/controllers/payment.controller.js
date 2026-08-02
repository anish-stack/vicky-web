const Joi = require("joi");
const { Transaction, Trip, TourBooking, User } = require("../models");
const razorpay = require("../services/razorpay.service");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, paginate, pageMeta } = require("../utils/response");

const objectId = Joi.string().hex().length(24);

const createOrderSchema = Joi.object({
  trip: objectId.allow(null, ""),
  tourBooking: objectId.allow(null, ""),
}).or("trip", "tourBooking");

const verifySchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

/**
 * POST /api/payments/create-order
 * The amount is derived server-side from the stored trip/booking, never from
 * the request body — this closes the tampering hole in the old flow.
 */
const createOrder = asyncHandler(async (req, res) => {
  const { trip: tripId, tourBooking: bookingId } = req.body;

  let amountInRupees = 0;
  let notes = {};
  let doc = null;
  let kind = null;

  if (tripId) {
    doc = await Trip.findById(tripId).populate("vehicle");
    if (!doc) throw ApiError.notFound("Trip not found");
    if (doc.trip_status === "cancelled") throw ApiError.badRequest("This trip has been cancelled");

    amountInRupees = doc.advanceAmount > 0 ? doc.advanceAmount : doc.discountedPrice || doc.quotedPrice;
    kind = "trip";
    notes = { kind, tripCode: doc.tripCode, phone: doc.customerPhone };
  } else {
    doc = await TourBooking.findById(bookingId);
    if (!doc) throw ApiError.notFound("Booking not found");
    if (doc.status === "cancelled") throw ApiError.badRequest("This booking has been cancelled");
    if (doc.paymentStatus === "paid") throw ApiError.badRequest("This booking is already paid");

    amountInRupees = doc.bookingChargeAmount;
    kind = "tour";
    notes = { kind, bookingCode: doc.bookingCode, phone: doc.mobileNumber };
  }

  if (!amountInRupees || amountInRupees <= 0) throw ApiError.badRequest("Payable amount is invalid");

  const amountInPaise = Math.round(amountInRupees * 100);

  const transaction = await Transaction.create({
    user: req.user?._id || doc.user || null,
    trip: kind === "trip" ? doc._id : null,
    tourBooking: kind === "tour" ? doc._id : null,
    vehicle: kind === "trip" ? doc.vehicle?._id || null : null,
    name: kind === "trip" ? doc.customerName : doc.fullName,
    email: kind === "trip" ? doc.customerEmail : doc.email,
    contact: kind === "trip" ? doc.customerPhone : doc.mobileNumber,
    vehicleName: kind === "trip" ? doc.vehicle?.title : doc.vehicleLabel,
    pickupAddress: kind === "trip" ? doc.pickupAddress : doc.pickupLocation,
    originalAmount: kind === "trip" ? doc.discountedPrice || doc.quotedPrice : doc.totalPayable,
    paidAmount: 0,
    status: "created",
    departureDate: kind === "trip" ? doc.departureDate : doc.pickupDate,
    returnDate: kind === "trip" ? doc.returnDate : doc.returnDate,
    distance: kind === "trip" ? doc.distance : null,
    tripType: kind === "trip" ? doc.trip_type : doc.tripType,
    category: kind === "trip" ? doc.category : "tourPackage",
    carTab: kind === "trip" ? doc.car_tab : "package",
  });

  const order = await razorpay.createOrder({
    amountInPaise,
    receipt: transaction.invoiceId,
    notes: { ...notes, transactionId: String(transaction._id) },
  });

  transaction.orderId = order.id;
  await transaction.save();

  return ok(
    res,
    {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: order.key,
      transactionId: transaction._id,
      invoiceId: transaction.invoiceId,
      prefill: {
        name: transaction.name || "",
        email: transaction.email || "",
        contact: transaction.contact || "",
      },
    },
    "Order created successfully"
  );
});

/** Shared post-success bookkeeping. */
async function markPaid(transaction, payment) {
  transaction.paymentId = payment.id;
  transaction.status = payment.status === "captured" ? "captured" : "authorized";
  transaction.paidAmount = (payment.amount || 0) / 100;
  transaction.method = payment.method || null;
  transaction.card = payment.card || null;
  transaction.upi = payment.upi || null;
  transaction.bank = payment.bank || null;
  transaction.wallet = payment.wallet || null;
  transaction.acquirerData = payment.acquirer_data || null;
  transaction.allDetails = payment;
  await transaction.save();

  if (transaction.trip) {
    await Trip.findByIdAndUpdate(transaction.trip, { trip_status: "confirmed" });
  }
  if (transaction.tourBooking) {
    const booking = await TourBooking.findById(transaction.tourBooking);
    if (booking) {
      booking.status = "confirmed";
      booking.paymentStatus =
        transaction.paidAmount >= booking.totalPayable ? "paid" : "partial";
      booking.transaction = transaction._id;
      await booking.save();
    }
  }
}

/** POST /api/payments/verify — called from the Razorpay checkout handler. */
const verify = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const valid = razorpay.verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  const transaction = await Transaction.findOne({ orderId: razorpay_order_id });
  if (!transaction) throw ApiError.notFound("Transaction not found");

  if (!valid) {
    transaction.status = "failed";
    transaction.errorReason = "signature_mismatch";
    transaction.errorDescription = "Payment signature verification failed";
    await transaction.save();
    throw ApiError.badRequest("Payment verification failed");
  }

  transaction.signature = razorpay_signature;
  const payment = await razorpay.fetchPayment(razorpay_payment_id);
  await markPaid(transaction, payment);

  return ok(
    res,
    { transaction: transaction.toJSON(), invoiceId: transaction.invoiceId },
    "Payment verified successfully"
  );
});

/** POST /api/payments/failed — record an abandoned/declined attempt. */
const recordFailure = asyncHandler(async (req, res) => {
  const { razorpay_order_id, reason, description } = req.body;
  const transaction = await Transaction.findOne({ orderId: razorpay_order_id });
  if (!transaction) throw ApiError.notFound("Transaction not found");

  transaction.status = "failed";
  transaction.errorReason = reason || null;
  transaction.errorDescription = description || null;
  await transaction.save();

  return ok(res, transaction.toJSON(), "Payment failure recorded");
});

/**
 * POST /api/payments/webhook
 * Mounted with express.raw() so the HMAC is computed over the exact bytes.
 */
const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const raw = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);

  if (!razorpay.verifyWebhookSignature(raw, signature)) {
    return res.status(400).json({ status: false, message: "Invalid webhook signature" });
  }

  const event = JSON.parse(raw);
  const payment = event.payload?.payment?.entity;

  if (payment?.order_id) {
    const transaction = await Transaction.findOne({ orderId: payment.order_id });
    if (transaction) {
      if (event.event === "payment.captured" || event.event === "payment.authorized") {
        await markPaid(transaction, payment);
      } else if (event.event === "payment.failed") {
        transaction.status = "failed";
        transaction.errorReason = payment.error_reason || null;
        transaction.errorDescription = payment.error_description || null;
        transaction.allDetails = payment;
        await transaction.save();
      }
    }
  }

  return res.status(200).json({ status: true });
});

/** GET /api/payments/:id */
const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { invoiceId: id };

  const transaction = await Transaction.findOne(query)
    .populate("trip tourBooking vehicle")
    .lean({ virtuals: true });
  if (!transaction) throw ApiError.notFound("Transaction not found");

  if (req.user && !["superadmin", "admin", "staff"].includes(req.user.role)) {
    const owns =
      String(transaction.user || "") === String(req.user._id) ||
      transaction.contact === req.user.phoneNumber;
    if (!owns) throw ApiError.forbidden("You cannot access this transaction");
  }

  return ok(res, transaction, "Transaction fetched successfully");
});

/** GET /api/payments — own transactions for customers, all for staff. */
const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (["customer", "driver", "partner"].includes(req.user.role)) {
    filter.$or = [{ user: req.user._id }, { contact: req.user.phoneNumber }];
  }
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
    Transaction.countDocuments(filter),
  ]);

  return ok(res, items, "Transactions fetched successfully", pageMeta(total, page, limit));
});

module.exports = { createOrderSchema, verifySchema, createOrder, verify, recordFailure, webhook, getOne, list };

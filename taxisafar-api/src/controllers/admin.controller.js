const crud = require("./_crud");
const {
  TourPackage, TourBooking, Hotel, Discount, BookingLimit, Pincode,
  OneWayTripPricing, AirportPricing, LocalRentalPricing, AdvancePayment,
  Enquiry, Newsletter, Trip, Transaction, User, Media,
} = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { ok, paginate, pageMeta } = require("../utils/response");

/**
 * Staff-only management endpoints. The public controllers stay read-only and
 * always filter `isActive`, so admin needs its own unfiltered views.
 */

const packages = crud(TourPackage, {
  searchFields: ["title", "fromCityName", "toCityName"],
  slugFrom: "title",
  defaultFilter: {},
});

const discounts = crud(Discount, { searchFields: ["title"], slugFrom: "title" });
const bookingLimits = crud(BookingLimit, { searchFields: [], populate: "city vehicle" });
const pincodes = crud(Pincode, { searchFields: ["pincode", "areaName"], populate: "city" });
const oneWaySlabs = crud(OneWayTripPricing, { searchFields: [], populate: "vehicle", sort: { from: 1 } });
const airportPricing = crud(AirportPricing, { searchFields: [], populate: "airport city vehicle" });
const localPricing = crud(LocalRentalPricing, { searchFields: [], populate: "plan city vehicle" });
const enquiries = crud(Enquiry, { searchFields: ["name", "phone", "email"], sort: { createdAt: -1 } });
const newsletter = crud(Newsletter, { searchFields: ["email"], sort: { createdAt: -1 } });
const users = crud(User, { searchFields: ["name", "email", "phoneNumber"], sort: { createdAt: -1 } });

/** GET /api/admin/packages — includes inactive rows. */
const listPackages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { fromCityName: rx }, { toCityName: rx }];
  }
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const [items, total] = await Promise.all([
    TourPackage.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
    TourPackage.countDocuments(filter),
  ]);

  return ok(res, items, "Packages fetched successfully", pageMeta(total, page, limit));
});

/** GET /api/admin/packages/:id — full document, active or not. */
const getPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
  const doc = await TourPackage.findOne(query).lean({ virtuals: true });
  if (!doc) throw ApiError.notFound("Package not found");
  return ok(res, doc, "Package fetched successfully");
});

/** GET /api/admin/tour-bookings */
const tourBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search), "i");
    filter.$or = [{ bookingCode: rx }, { fullName: rx }, { mobileNumber: rx }, { packageTitle: rx }];
  }

  const [items, total] = await Promise.all([
    TourBooking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
    TourBooking.countDocuments(filter),
  ]);
  return ok(res, items, "Bookings fetched successfully", pageMeta(total, page, limit));
});

/** PATCH /api/admin/tour-bookings/:id */
const updateTourBooking = asyncHandler(async (req, res) => {
  const allowed = ["status", "paymentStatus"];
  const payload = {};
  for (const k of allowed) if (req.body[k] !== undefined) payload[k] = req.body[k];

  const doc = await TourBooking.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!doc) throw ApiError.notFound("Booking not found");
  return ok(res, doc.toJSON(), "Booking updated successfully");
});

/** GET /api/admin/advance-payment  ·  PUT to update */
const getAdvance = asyncHandler(async (req, res) => {
  const row = (await AdvancePayment.findOne().lean()) || { percentage: 0 };
  return ok(res, row, "Advance payment fetched successfully");
});

const setAdvance = asyncHandler(async (req, res) => {
  const row = await AdvancePayment.findOneAndUpdate(
    {},
    { percentage: Number(req.body.percentage) || 0 },
    { upsert: true, new: true }
  );
  return ok(res, row.toJSON(), "Advance payment updated successfully");
});

/** GET /api/admin/stats — dashboard tiles + 30-day revenue series. */
const stats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    trips, tripsPending, tourBookingsCount, packagesCount,
    hotelsCount, enquiriesNew, subscribers, revenueAgg, series,
  ] = await Promise.all([
    Trip.countDocuments(),
    Trip.countDocuments({ trip_status: "pending" }),
    TourBooking.countDocuments(),
    TourPackage.countDocuments({ isActive: true }),
    Hotel.countDocuments({ isActive: true }),
    Enquiry.countDocuments({ status: "new" }),
    Newsletter.countDocuments({ isActive: true }),
    Transaction.aggregate([
      { $match: { status: { $in: ["captured", "authorized"] } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { status: { $in: ["captured", "authorized"] }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$paidAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return ok(
    res,
    {
      trips,
      tripsPending,
      tourBookings: tourBookingsCount,
      packages: packagesCount,
      hotels: hotelsCount,
      enquiriesNew,
      subscribers,
      revenue: revenueAgg[0]?.total || 0,
      payments: revenueAgg[0]?.count || 0,
      series: series.map((s) => ({ date: s._id, amount: s.amount, count: s.count })),
    },
    "Stats fetched successfully"
  );
});

module.exports = {
  packages, discounts, bookingLimits, pincodes, oneWaySlabs,
  airportPricing, localPricing, enquiries, newsletter, users,
  listPackages, getPackage, tourBookings, updateTourBooking,
  getAdvance, setAdvance, stats,
};
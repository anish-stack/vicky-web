const Joi = require("joi");
const { Trip, Session, Vehicle, DhamPackage, DhamCategory } = require("../models");
const { getRemainingLimit } = require("./quote.controller");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginate, pageMeta } = require("../utils/response");

const objectId = Joi.string().hex().length(24);

const createSchema = Joi.object({
  session: objectId.allow(null, ""),
  sessionId: Joi.string().allow(null, ""),
  vehicle: objectId.required(),

  customerName: Joi.string().max(80).allow("", null),
  customerPhone: Joi.string().min(10).max(15).required(),
  customerEmail: Joi.string().email().allow("", null),
  pickupAddress: Joi.string().allow("", null),

  quotedPrice: Joi.number().required(),
  discount: Joi.number().default(0),
  discountedPrice: Joi.number().default(0),
  advanceAmount: Joi.number().default(0),
  includedKm: Joi.string().allow("", null),
  taxInclusive: Joi.boolean().default(false),
});

/** POST /api/trips — freeze a quote into a trip/enquiry. */
const create = asyncHandler(async (req, res) => {
  const body = req.body;

  const query = body.session
    ? { _id: body.session }
    : { sessionId: body.sessionId };
  const session = await Session.findOne(query).lean();
  if (!session) throw ApiError.notFound("Session not found or expired");

  const vehicle = await Vehicle.findById(body.vehicle).lean();
  if (!vehicle) throw ApiError.notFound("Vehicle not found");

  // re-check the booking cap right before writing
  const limit = await getRemainingLimit({
    cityId: session.city,
    vehicleId: vehicle._id,
    date: session.pickUpDate,
  });
  if (limit && limit.remaining <= 0) {
    throw ApiError.conflict("This vehicle is fully booked for the selected date");
  }

  let dhamPackageName = null;
  let dhamPickupCityName = null;
  let dhamCategoryName = null;

  if (session.dhamPackage) {
    const pkg = await DhamPackage.findById(session.dhamPackage).lean();
    dhamPackageName = pkg?.name || null;
    dhamPickupCityName =
      (pkg?.pickupCities || []).find((c) => String(c._id) === String(session.dhamPickupCityId))?.name || null;
    if (session.dhamCategory) {
      dhamCategoryName = (await DhamCategory.findById(session.dhamCategory).lean())?.name || null;
    }
  }

  const trip = await Trip.create({
    user: req.user?._id || null,
    session: session._id,
    vehicle: vehicle._id,

    pickupAddress: body.pickupAddress || session.places?.[0]?.label || null,
    pincode: session.pincode,
    places: session.places,

    departureDate: session.pickUpDate,
    returnDate: session.dropDate,
    distance: session.distance,

    trip_type: session.tripType,
    category: session.category,
    car_tab: session.car_tab,

    quotedPrice: body.quotedPrice,
    discount: body.discount,
    discountedPrice: body.discountedPrice,
    advanceAmount: body.advanceAmount,
    includedKm: body.includedKm,
    taxInclusive: body.taxInclusive,

    extra_km: vehicle.extra_fare_km,
    toll_tax: body.taxInclusive ? "Included" : "Not Include",
    parking_charges: vehicle.parkingcharges,
    driver_charges: vehicle.drivercharges,
    night_charges: vehicle.nightcharges,
    fuel_charges: vehicle.fuelcharges,

    city: session.city,
    localRentalPlan: session.localRentalPlan,
    airport: session.airport,
    airportCity: session.airportCity,
    airportFromTo: session.airportFromTo,

    dhamCategory: session.dhamCategory,
    dhamCategoryName,
    dhamPackage: session.dhamPackage,
    dhamPackageName,
    dhamPickupCityId: session.dhamPickupCityId,
    dhamPickupCityName,
    dhamPackageDays: session.dhamPackageDays,

    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerEmail: body.customerEmail,
  });

  return created(res, trip.toJSON(), "Trip created successfully");
});

/** GET /api/trips — own trips for customers, all for staff. */
const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);

  const filter = {};
  if (["customer", "driver", "partner"].includes(req.user.role)) {
    filter.$or = [{ user: req.user._id }, { customerPhone: req.user.phoneNumber }];
  }
  if (req.query.status) filter.trip_status = req.query.status;
  if (req.query.car_tab) filter.car_tab = req.query.car_tab;

  const [items, total] = await Promise.all([
    Trip.find(filter).populate("vehicle city").sort({ createdAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
    Trip.countDocuments(filter),
  ]);

  return ok(res, items, "Trips fetched successfully", pageMeta(total, page, limit));
});

const assertOwnership = (trip, user) => {
  if (!user) throw ApiError.unauthorized();
  const isStaff = ["superadmin", "admin", "staff"].includes(user.role);
  const isOwner =
    String(trip.user || "") === String(user._id) || trip.customerPhone === user.phoneNumber;
  if (!isStaff && !isOwner) throw ApiError.forbidden("You cannot access this trip");
};

/** GET /api/trips/:id */
const getOne = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate("vehicle city airport dhamPackage")
    .lean({ virtuals: true });
  if (!trip) throw ApiError.notFound("Trip not found");
  assertOwnership(trip, req.user);
  return ok(res, trip, "Trip fetched successfully");
});

/** PATCH /api/trips/:id/cancel */
const cancel = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw ApiError.notFound("Trip not found");
  assertOwnership(trip, req.user);

  if (["completed", "cancelled"].includes(trip.trip_status)) {
    throw ApiError.badRequest(`Trip is already ${trip.trip_status}`);
  }

  trip.trip_status = "cancelled";
  trip.cancelledAt = new Date();
  trip.cancelReason = req.body?.reason || null;
  await trip.save();

  return ok(res, trip.toJSON(), "Trip cancelled successfully");
});

/** PATCH /api/trips/:id/status — staff only. */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Trip.TRIP_STATUS.includes(status)) throw ApiError.badRequest("Invalid trip status");

  const trip = await Trip.findById(req.params.id);
  if (!trip) throw ApiError.notFound("Trip not found");

  trip.trip_status = status;
  if (status === "completed") trip.completedAt = new Date();
  if (status === "cancelled") trip.cancelledAt = new Date();
  await trip.save();

  return ok(res, trip.toJSON(), "Trip status updated successfully");
});

module.exports = { createSchema, create, list, getOne, cancel, updateStatus };

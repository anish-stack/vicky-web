const Joi = require("joi");
const { TourPackage, TourBooking, Hotel } = require("../models");
const { computeTourTotals } = require("../services/pricing.service");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginate, pageMeta } = require("../utils/response");

/* ------------------------------------------------------------------ */
/* Listing                                                             */
/* ------------------------------------------------------------------ */

/** GET /api/packages — card grid for the Packages page. */
const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, { limit: 12 });

  const filter = { isActive: true };
  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.from) filter.fromCityName = new RegExp(`^${req.query.from}$`, "i");
  if (req.query.days) filter.days = Number(req.query.days);
  if (req.query.tripType) filter.tripType = req.query.tripType;
  if (req.query.featured === "true") filter.isFeatured = true;

  const sortMap = {
    price_asc: { sortOrder: 1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
    default: { sortOrder: 1, createdAt: -1 },
  };
  const sort = sortMap[req.query.sort] || sortMap.default;

  const [items, total] = await Promise.all([
    TourPackage.find(filter)
      .select(
        "title slug fromCityName toCityName coverImage days nights durationLabel tripType " +
          "shortDescription highlights hotelOptional vehicleOptions rating reviewCount isFeatured seo"
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    TourPackage.countDocuments(filter),
  ]);

  // trim the payload: cards only need the cheapest all-inclusive fare
  const cards = items.map((p) => {
    const active = (p.vehicleOptions || []).filter((v) => v.isActive);
    const startingPrice = active.length ? Math.min(...active.map((v) => v.price)) : 0;
    const { vehicleOptions, ...rest } = p;
    return { ...rest, startingPrice, vehicleCount: active.length };
  });

  return ok(res, cards, "Packages fetched successfully", pageMeta(total, page, limit));
});

/** GET /api/packages/slugs — for getStaticPaths / sitemap. */
const slugs = asyncHandler(async (req, res) => {
  const rows = await TourPackage.find({ isActive: true }).select("slug updatedAt").lean();
  return ok(res, rows, "Slugs fetched successfully");
});

/** GET /api/packages/:slug — full detail for the 3-step tour pages. */
const detail = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const query = /^[a-f\d]{24}$/i.test(slug) ? { _id: slug } : { slug };

  const pkg = await TourPackage.findOne({ ...query, isActive: true })
    .populate("hotelOptions.hotel")
    .populate("vehicleOptions.vehicle", "title image passengers large_size_bag ac_cab")
    .lean({ virtuals: true });

  if (!pkg) throw ApiError.notFound("Package not found");

  pkg.vehicleOptions = (pkg.vehicleOptions || [])
    .filter((v) => v.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.price - b.price);

  pkg.hotelOptions = (pkg.hotelOptions || [])
    .filter((h) => h.isActive && h.hotel)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((h) => ({
      ...h,
      price: h.priceOverride ?? h.hotel.pricePerNight,
    }));

  const active = pkg.vehicleOptions;
  pkg.startingPrice = active.length ? Math.min(...active.map((v) => v.price)) : 0;

  return ok(res, pkg, "Package fetched successfully");
});

/** GET /api/packages/:slug/related */
const related = asyncHandler(async (req, res) => {
  const pkg = await TourPackage.findOne({ slug: req.params.slug }).lean();
  if (!pkg) throw ApiError.notFound("Package not found");

  const items = await TourPackage.find({
    _id: { $ne: pkg._id },
    isActive: true,
    $or: [{ fromCityName: pkg.fromCityName }, { days: pkg.days }],
  })
    .select("title slug fromCityName toCityName coverImage durationLabel vehicleOptions rating reviewCount")
    .limit(6)
    .lean({ virtuals: true });

  return ok(
    res,
    items.map(({ vehicleOptions, ...rest }) => ({
      ...rest,
      startingPrice: vehicleOptions?.length ? Math.min(...vehicleOptions.map((v) => v.price)) : 0,
    })),
    "Related packages fetched successfully"
  );
});

/* ------------------------------------------------------------------ */
/* Quote + booking                                                     */
/* ------------------------------------------------------------------ */

const quoteSchema = Joi.object({
  packageSlug: Joi.string().required(),
  vehicleOptionId: Joi.string().hex().length(24).required(),
  hotelOptionId: Joi.string().hex().length(24).allow(null, ""),
  rooms: Joi.number().integer().min(1).default(1),
  nights: Joi.number().integer().min(1).allow(null),
});

/** Resolve the authoritative price server-side — never trust client totals. */
async function priceSelection({ packageSlug, vehicleOptionId, hotelOptionId, rooms = 1, nights }) {
  const pkg = await TourPackage.findOne({ slug: packageSlug, isActive: true })
    .populate("hotelOptions.hotel")
    .lean();
  if (!pkg) throw ApiError.notFound("Package not found");

  const vehicleOption = (pkg.vehicleOptions || []).find(
    (v) => String(v._id) === String(vehicleOptionId) && v.isActive
  );
  if (!vehicleOption) throw ApiError.badRequest("Selected vehicle is not available for this package");

  let hotelOption = null;
  if (hotelOptionId) {
    hotelOption = (pkg.hotelOptions || []).find(
      (h) => String(h._id) === String(hotelOptionId) && h.isActive
    );
    if (!hotelOption) throw ApiError.badRequest("Selected hotel is not available for this package");
  }

  const effectiveNights = nights || hotelOption?.nights || pkg.nights || 1;
  const hotelPerNight = hotelOption
    ? hotelOption.priceOverride ?? hotelOption.hotel?.pricePerNight ?? 0
    : 0;

  const totals = computeTourTotals({
    cabCharge: vehicleOption.price,
    hotelCharge: hotelPerNight,
    rooms: hotelOption ? rooms : 0,
    nights: hotelOption ? effectiveNights : 0,
    bookingChargePercent: pkg.bookingChargePercent,
  });

  return { pkg, vehicleOption, hotelOption, nights: effectiveNights, rooms, totals };
}

/** POST /api/packages/quote — live price summary for the booking screen. */
const quote = asyncHandler(async (req, res) => {
  const { pkg, vehicleOption, hotelOption, nights, rooms, totals } = await priceSelection(req.body);

  return ok(
    res,
    {
      package: { id: pkg._id, title: pkg.title, slug: pkg.slug, durationLabel: pkg.durationLabel },
      vehicle: {
        id: vehicleOption._id,
        label: vehicleOption.label,
        image: vehicleOption.image,
        seats: vehicleOption.seats,
        suitcases: vehicleOption.suitcases,
        ac: vehicleOption.ac,
      },
      hotel: hotelOption
        ? {
            id: hotelOption._id,
            name: hotelOption.hotel?.name,
            roomType: hotelOption.hotel?.roomType,
            image: hotelOption.hotel?.image,
            checkIn: hotelOption.hotel?.checkInTime,
            checkOut: hotelOption.hotel?.checkOutTime,
            nights,
            rooms,
          }
        : null,
      ...totals,
    },
    "Quote generated successfully"
  );
});

const bookingSchema = quoteSchema.keys({
  fullName: Joi.string().min(2).max(80).required(),
  mobileNumber: Joi.string().min(10).max(15).required(),
  email: Joi.string().email().allow("", null),
  pickupLocation: Joi.string().required(),
  pickupAddress: Joi.string().allow("", null),
  pickupDate: Joi.date().iso().required(),
  returnDate: Joi.date().iso().allow(null, ""),
  adults: Joi.number().integer().min(1).default(2),
  children: Joi.number().integer().min(0).default(0),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    "any.only": "You must accept the terms and conditions to continue",
  }),
});

/** POST /api/packages/book */
const book = asyncHandler(async (req, res) => {
  const body = req.body;
  const { pkg, vehicleOption, hotelOption, nights, rooms, totals } = await priceSelection(body);

  const booking = await TourBooking.create({
    user: req.user?._id || null,

    package: pkg._id,
    packageTitle: pkg.title,
    packageSlug: pkg.slug,
    durationLabel: pkg.durationLabel,
    tripType: pkg.tripType,

    vehicleOptionId: vehicleOption._id,
    vehicleLabel: vehicleOption.label,
    vehicleImage: vehicleOption.image,
    cabCharge: totals.cabCharge,

    hotelOptionId: hotelOption?._id || null,
    hotel: hotelOption?.hotel?._id || null,
    hotelName: hotelOption?.hotel?.name || null,
    hotelRoomType: hotelOption?.hotel?.roomType || null,
    hotelNights: hotelOption ? nights : 0,
    rooms: hotelOption ? rooms : 0,
    hotelCharge: totals.hotelCharge,
    hotelRequired: Boolean(hotelOption),

    adults: body.adults,
    children: body.children,

    pickupLocation: body.pickupLocation,
    pickupAddress: body.pickupAddress || null,
    pickupDate: body.pickupDate,
    returnDate: body.returnDate || null,

    fullName: body.fullName,
    mobileNumber: body.mobileNumber,
    email: body.email || null,

    totalPayable: totals.totalPayable,
    bookingChargePercent: totals.bookingChargePercent,
    bookingChargeAmount: totals.bookingChargeAmount,
    balanceDue: totals.balanceDue,

    termsAccepted: true,
  });

  return created(res, booking.toJSON(), "Booking created successfully");
});

/** GET /api/packages/bookings/:id */
const getBooking = asyncHandler(async (req, res) => {
  const booking = await TourBooking.findById(req.params.id).populate("package hotel").lean({ virtuals: true });
  if (!booking) throw ApiError.notFound("Booking not found");

  if (req.user && !["superadmin", "admin", "staff"].includes(req.user.role)) {
    const owns =
      String(booking.user || "") === String(req.user._id) ||
      booking.mobileNumber === req.user.phoneNumber;
    if (!owns) throw ApiError.forbidden("You cannot access this booking");
  }

  return ok(res, booking, "Booking fetched successfully");
});

/** GET /api/packages/bookings — current user's package bookings. */
const myBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { $or: [{ user: req.user._id }, { mobileNumber: req.user.phoneNumber }] };

  const [items, total] = await Promise.all([
    TourBooking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
    TourBooking.countDocuments(filter),
  ]);

  return ok(res, items, "Bookings fetched successfully", pageMeta(total, page, limit));
});

/** GET /api/hotels/by-package/:slug */
const packageHotels = asyncHandler(async (req, res) => {
  const pkg = await TourPackage.findOne({ slug: req.params.slug }).populate("hotelOptions.hotel").lean();
  if (!pkg) throw ApiError.notFound("Package not found");

  const hotels = (pkg.hotelOptions || [])
    .filter((h) => h.isActive && h.hotel)
    .map((h) => ({ ...h.hotel, optionId: h._id, price: h.priceOverride ?? h.hotel.pricePerNight, nights: h.nights }));

  return ok(res, hotels, "Hotels fetched successfully");
});

module.exports = {
  quoteSchema, bookingSchema,
  list, slugs, detail, related, quote, book, getBooking, myBookings, packageHotels,
  priceSelection,
};

const {
  Session, Vehicle, AirportPricing, LocalRentalPricing, DhamPackage,
  OneWayTripPricing, AdvancePayment, Setting, BookingLimit, Trip,
} = require("../models");
const { computePrices } = require("../services/pricing.service");
const { resolveDiscountContext, attachDiscounts } = require("../services/discount.service");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

/** Advance % + toll-tax rates, previously served by /api/advance_payment. */
async function getFareSettings() {
  const [advance, tollTax, roundtripTollTax] = await Promise.all([
    AdvancePayment.findOne().lean(),
    Setting.get("toll_tax", 0),
    Setting.get("roundtrip_toll_tax", 0),
  ]);
  return {
    percentage: advance?.percentage || 0,
    toll_tax: parseFloat(tollTax) || 0,
    roundtrip_toll_tax: parseFloat(roundtripTollTax) || 0,
  };
}

/** GET /api/fare-settings */
const fareSettings = asyncHandler(async (req, res) =>
  ok(res, await getFareSettings(), "Fare settings fetched successfully")
);

/**
 * Load vehicles with exactly the pricing rows the fare formula needs for this
 * trip shape, keeping the legacy attached-array field names intact.
 */
async function loadVehiclesFor(session) {
  const vehicles = await Vehicle.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  const ids = vehicles.map((v) => v._id);
  const byId = new Map(vehicles.map((v) => [String(v._id), { ...v, id: String(v._id) }]));

  const carTab = session.car_tab;
  const category = session.category;
  const tripType = session.tripType;

  // one-way slabs are always needed for the outstation one-way branch
  if (category === "outstation" && tripType === "oneWay") {
    const slabs = await OneWayTripPricing.find({ vehicle: { $in: ids } }).sort({ from: 1 }).lean();
    for (const s of slabs) {
      const v = byId.get(String(s.vehicle));
      if (!v) continue;
      (v.one_way_trip_pricings ||= []).push(s);
    }
  }

  if (category === "localairport" && tripType === "airport" && session.airport && session.airportCity) {
    const rows = await AirportPricing.find({
      airport: session.airport._id || session.airport,
      city: session.airportCity._id || session.airportCity,
      vehicle: { $in: ids },
    }).lean();
    for (const r of rows) {
      const v = byId.get(String(r.vehicle));
      if (v) (v.airport_pricings ||= []).push(r);
    }
  }

  if (category === "localairport" && tripType === "local" && session.localRentalPlan && session.city) {
    const rows = await LocalRentalPricing.find({
      plan: session.localRentalPlan._id || session.localRentalPlan,
      city: session.city._id || session.city,
      vehicle: { $in: ids },
    }).lean();
    for (const r of rows) {
      const v = byId.get(String(r.vehicle));
      if (v) (v.local_rental_pricings ||= []).push(r);
    }
  }

  if (carTab === "chardham" && session.dhamPackage && session.dhamPickupCityId) {
    const pkgId = session.dhamPackage._id || session.dhamPackage;
    const pkg = await DhamPackage.findById(pkgId).lean();
    const pickup = (pkg?.pickupCities || []).find(
      (c) => String(c._id) === String(session.dhamPickupCityId)
    );
    for (const p of pickup?.pricings || []) {
      const v = byId.get(String(p.vehicle));
      if (v) (v.dham_pricings ||= []).push(p);
    }
  }

  let list = [...byId.values()];

  // hide vehicles with no applicable rate for this trip shape
  if (carTab === "chardham") list = list.filter((v) => v.dham_pricings?.length);
  if (category === "localairport" && tripType === "airport") list = list.filter((v) => v.airport_pricings?.length);
  if (category === "localairport" && tripType === "local") list = list.filter((v) => v.local_rental_pricings?.length);

  return list;
}

/** Remaining seats for a city+vehicle+date, using the date rule then the fallback rule. */
async function getRemainingLimit({ cityId, vehicleId, date }) {
  if (!cityId || !vehicleId || !date) return null;

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);

  const rule =
    (await BookingLimit.findOne({ city: cityId, vehicle: vehicleId, limitDate: { $gte: day, $lt: nextDay } }).lean()) ||
    (await BookingLimit.findOne({ city: cityId, vehicle: vehicleId, limitDate: null }).lean());

  if (!rule) return null;

  const used = await Trip.countDocuments({
    city: cityId,
    vehicle: vehicleId,
    departureDate: { $gte: day, $lt: nextDay },
    trip_status: { $in: ["pending", "confirmed", "ongoing"] },
  });

  return { maxLimit: rule.maxLimit, used, remaining: Math.max(0, rule.maxLimit - used) };
}

/**
 * GET /api/quote/:sessionId?tax_included=true
 * Returns every eligible vehicle with its fare, discount and advance amount.
 */
const getQuote = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const taxIncluded = req.query.tax_included === "true" || req.query.tax_included === "1";

  const query = /^[a-f\d]{24}$/i.test(sessionId) ? { _id: sessionId } : { sessionId };
  const session = await Session.findOne(query).lean();
  if (!session) throw ApiError.notFound("Session not found or expired");

  const settings = await getFareSettings();
  const vehicles = await loadVehiclesFor(session);

  const pickupPlaceId = session.places?.[0]?.value || null;
  const dropPlaceId = session.places?.length
    ? session.places[session.places.length - 1].value
    : null;

  const discountCtx = await resolveDiscountContext({
    slug: session.discountSlug,
    tripType: session.tripType,
    cityId: session.city,
    pickupPlaceId,
    dropPlaceId,
  });

  const withDiscounts = attachDiscounts(vehicles, discountCtx);

  // round trip uses roundtrip_toll_tax, everything else uses toll_tax
  const tollTax =
    session.tripType === "roundTrip" ? settings.roundtrip_toll_tax : settings.toll_tax;

  const priced = computePrices(withDiscounts, {
    category: session.category,
    carTab: session.car_tab,
    tripType: session.tripType,
    distance: session.distance,
    departureDate: session.pickUpDate,
    returnDate: session.dropDate,
    time: session.time,
    taxIncluded,
    tollTax,
    overAllDiscount: discountCtx.overAllDiscount,
    cityWiseDiscount: discountCtx.cityWiseDiscount,
    advancePaymentPercentage: settings.percentage,
  });

  // annotate availability where booking limits are configured
  const withAvailability = await Promise.all(
    priced.map(async (v) => ({
      ...v,
      availability: await getRemainingLimit({
        cityId: session.city,
        vehicleId: v.id || v._id,
        date: session.pickUpDate,
      }),
    }))
  );

  return ok(
    res,
    {
      session,
      taxIncluded,
      settings,
      discount: {
        overAllDiscount: discountCtx.overAllDiscount,
        cityWiseDiscount: discountCtx.cityWiseDiscount,
      },
      vehicles: withAvailability,
    },
    "Quote generated successfully"
  );
});

/** POST /api/quote/check-availability */
const checkAvailability = asyncHandler(async (req, res) => {
  const { city, vehicle, date } = req.body;
  const limit = await getRemainingLimit({ cityId: city, vehicleId: vehicle, date });

  if (!limit) return ok(res, { available: true, unlimited: true }, "Booking available");
  return ok(
    res,
    { available: limit.remaining > 0, ...limit },
    limit.remaining > 0 ? "Booking available" : "No cabs left for this date"
  );
});

module.exports = { fareSettings, getQuote, checkAvailability, getFareSettings, getRemainingLimit };

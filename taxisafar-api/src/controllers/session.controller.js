const Joi = require("joi");
const { Session } = require("../models");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");

const generateSessionId = () => {
  const datePart = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const randomPart = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `SID-${datePart}-${randomPart}`;
};

const objectId = Joi.string().hex().length(24).allow(null, "");

const placeSchema = Joi.object({
  label: Joi.string().allow("", null),
  value: Joi.string().required(),
  order: Joi.number().default(0),
});

/**
 * Validation mirrors the legacy Joi rules: pickup must be >= 3h from now (IST),
 * drop must be >= 1h after pickup, and per-tab required fields are enforced.
 */
const createSchema = Joi.object({
  car_tab: Joi.string().valid("taxi", "chardham", "hotel").required(),
  tripType: Joi.string().valid("oneWay", "roundTrip", "local", "airport").allow(null, ""),
  category: Joi.string().valid("outstation", "localairport").allow(null, ""),

  distance: Joi.number().allow(null),
  phoneNo: Joi.string().min(5).max(15).required(),
  pickUpDate: Joi.date().iso().allow(null, "").custom((value, helpers) => {
    if (!value) return value;
    const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const minTime = new Date(istNow.getTime() + 3 * 60 * 60 * 1000);
    if (new Date(value) < minTime) {
      return helpers.message("Pickup Date Time must be at least 3 hours from the current IST time.");
    }
    return value;
  }),
  dropDate: Joi.date().iso().allow(null, "").custom((value, helpers) => {
    if (!value) return value;
    const { pickUpDate } = helpers.state.ancestors[0];
    if (!pickUpDate) return value;
    const minDrop = new Date(new Date(pickUpDate).getTime() + 60 * 60 * 1000);
    if (new Date(value) < minDrop) {
      return helpers.message("Drop Date Time must be at least 1 hour after Pickup Date Time.");
    }
    return value;
  }),

  places: Joi.array().items(placeSchema).default([]),
  pincode: Joi.string().allow(null, ""),
  city: objectId,
  discountSlug: Joi.string().allow(null, ""),

  localRentalPlan: objectId,
  time: Joi.number().allow(null),
  airport: objectId,
  airportCity: objectId,
  airportFromTo: Joi.string().valid("from", "to").allow(null, ""),

  hotelCity: objectId,
  check_in: Joi.date().iso().allow(null, ""),
  check_out: Joi.date().iso().allow(null, ""),
  adult: Joi.number().integer().allow(null),
  children: Joi.number().integer().allow(null),
  rooms: Joi.number().integer().allow(null),
  children_ages: Joi.array().items(Joi.number()).default([]),

  dhamCategory: objectId,
  dhamPackage: objectId,
  dhamPickupCityId: objectId,
  dhamPackageDays: Joi.number().allow(null),
})
  .when(Joi.object({ car_tab: Joi.valid("taxi") }).unknown(), {
    then: Joi.object({
      tripType: Joi.required(),
      category: Joi.required(),
      distance: Joi.number().required(),
    }),
  })
  .when(Joi.object({ car_tab: Joi.valid("hotel") }).unknown(), {
    then: Joi.object({
      check_in: Joi.required(),
      check_out: Joi.required(),
      adult: Joi.number().integer().required(),
      rooms: Joi.number().integer().required(),
    }),
  });

/** POST /api/sessions */
const create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  // blank strings -> null so Mongoose casting stays happy
  for (const [k, v] of Object.entries(payload)) if (v === "") payload[k] = null;

  const session = await Session.create({ ...payload, sessionId: generateSessionId() });
  return created(res, session.toJSON(), "Session created successfully");
});

/** GET /api/sessions/:sessionId */
const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { sessionId: id };

  const session = await Session.findOne(query)
    .populate("city localRentalPlan airport airportCity hotelCity dhamCategory")
    .populate({ path: "dhamPackage", populate: { path: "category" } })
    .lean({ virtuals: true });

  if (!session) throw ApiError.notFound("Session not found or expired");
  return ok(res, session, "Session fetched successfully");
});

/** PUT /api/sessions/:sessionId */
const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { sessionId: id };

  const payload = { ...req.body };
  for (const [k, v] of Object.entries(payload)) if (v === "") payload[k] = null;
  delete payload.sessionId;

  const session = await Session.findOneAndUpdate(query, payload, { new: true });
  if (!session) throw ApiError.notFound("Session not found or expired");
  return ok(res, session.toJSON(), "Session updated successfully");
});

module.exports = { createSchema, create, getOne, update };

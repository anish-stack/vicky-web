const maps = require("../services/maps.service");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

/**
 * Thin proxy over the Google Maps APIs. Keeping this server-side means the
 * key never reaches the browser and every call can be rate limited.
 */

const autocomplete = asyncHandler(async (req, res) => {
  const { input, cities } = req.query;
  if (!input || input.length < 2) return ok(res, [], "Query too short");
  const results = await maps.autocomplete(input, { cityOnly: cities === "true" });
  return ok(res, results, "Suggestions fetched successfully");
});

const locality = asyncHandler(async (req, res) => {
  const { place_id } = req.query;
  if (!place_id) throw ApiError.badRequest("place_id is required");
  return ok(res, await maps.locality(place_id), "Locality fetched successfully");
});

const pincode = asyncHandler(async (req, res) => {
  const { place_id } = req.query;
  if (!place_id) throw ApiError.badRequest("place_id is required");
  return ok(res, { pincode: await maps.getPincode(place_id) }, "Pincode fetched successfully");
});

/** POST /api/maps/route  { places: [place_id, ...] } */
const route = asyncHandler(async (req, res) => {
  const places = req.body.places || [];
  if (places.length < 2) throw ApiError.badRequest("At least two places are required");
  return ok(res, await maps.routeDistance(places), "Route calculated successfully");
});

const distanceMatrix = asyncHandler(async (req, res) => {
  const { origins = [], destinations = [] } = req.body;
  if (!origins.length || !destinations.length) {
    throw ApiError.badRequest("origins and destinations are required");
  }
  return ok(res, await maps.distanceMatrix(origins, destinations), "Distance matrix fetched successfully");
});

module.exports = { autocomplete, locality, pincode, route, distanceMatrix };

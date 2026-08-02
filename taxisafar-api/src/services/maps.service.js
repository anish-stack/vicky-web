const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

const BASE = "https://maps.googleapis.com/maps/api";

function assertKey() {
  if (!env.googleMapsKey) throw ApiError.internal("Google Maps API key is not configured");
}

async function autocomplete(input, { cityOnly = false, components = "country:in" } = {}) {
  assertKey();
  const { data } = await axios.get(`${BASE}/place/autocomplete/json`, {
    params: {
      input,
      key: env.googleMapsKey,
      components,
      ...(cityOnly ? { types: "(cities)" } : {}),
    },
    timeout: 12000,
  });
  return (data.predictions || []).map((p) => ({
    label: p.description,
    value: p.place_id,
    mainText: p.structured_formatting?.main_text,
    secondaryText: p.structured_formatting?.secondary_text,
  }));
}

async function placeDetails(placeId, fields = "address_component,geometry,name,formatted_address") {
  assertKey();
  const { data } = await axios.get(`${BASE}/place/details/json`, {
    params: { place_id: placeId, key: env.googleMapsKey, fields },
    timeout: 12000,
  });
  return data.result || null;
}

/** Locality (city) name for a place_id — used to map a pickup point to a serviceable city. */
async function locality(placeId) {
  const result = await placeDetails(placeId, "address_component,name,formatted_address");
  if (!result) return null;
  const comps = result.address_components || [];
  const pick = (type) => comps.find((c) => c.types.includes(type))?.long_name || null;
  return {
    locality: pick("locality") || pick("administrative_area_level_3"),
    district: pick("administrative_area_level_2"),
    state: pick("administrative_area_level_1"),
    pincode: pick("postal_code"),
    formattedAddress: result.formatted_address,
  };
}

async function getPincode(placeId) {
  const info = await locality(placeId);
  return info?.pincode || null;
}

/**
 * Total driving distance in km across an ordered list of place_ids.
 * Waypoints are respected so multi-city trips price correctly.
 */
async function routeDistance(placeIds = []) {
  assertKey();
  if (placeIds.length < 2) throw ApiError.badRequest("At least two places are required");

  const origin = `place_id:${placeIds[0]}`;
  const destination = `place_id:${placeIds[placeIds.length - 1]}`;
  const waypoints = placeIds.slice(1, -1).map((p) => `place_id:${p}`);

  const { data } = await axios.get(`${BASE}/directions/json`, {
    params: {
      origin,
      destination,
      key: env.googleMapsKey,
      ...(waypoints.length ? { waypoints: waypoints.join("|") } : {}),
    },
    timeout: 15000,
  });

  if (data.status !== "OK" || !data.routes?.length) {
    throw ApiError.badRequest(data.error_message || `Route not found (${data.status})`);
  }

  const legs = data.routes[0].legs || [];
  const meters = legs.reduce((sum, l) => sum + (l.distance?.value || 0), 0);
  const seconds = legs.reduce((sum, l) => sum + (l.duration?.value || 0), 0);

  return {
    distanceKm: Number((meters / 1000).toFixed(2)),
    durationMinutes: Math.round(seconds / 60),
    legs: legs.map((l) => ({
      distanceText: l.distance?.text,
      durationText: l.duration?.text,
      startAddress: l.start_address,
      endAddress: l.end_address,
    })),
  };
}

async function distanceMatrix(origins, destinations) {
  assertKey();
  const { data } = await axios.get(`${BASE}/distancematrix/json`, {
    params: {
      origins: origins.map((o) => `place_id:${o}`).join("|"),
      destinations: destinations.map((d) => `place_id:${d}`).join("|"),
      key: env.googleMapsKey,
    },
    timeout: 15000,
  });
  return data;
}

module.exports = { autocomplete, placeDetails, locality, getPincode, routeDistance, distanceMatrix };

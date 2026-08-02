/**
 * pricing.service.js
 * ------------------------------------------------------------------
 * EXACT port of the live TaxiSafar fare calculation.
 *
 * The original math ran client-side in `pages/vehicles.tsx`. It has been moved
 * server-side unchanged so the API is the single source of truth. Every
 * Math.floor / Math.round / Math.max call sits in the same place as before —
 * do not "clean up" this file, the rounding order is load-bearing and any
 * change will shift live fares.
 * ------------------------------------------------------------------
 */

/** Legacy helper: whole-day difference, partial days rounded up, min 1. */
function calculateDaysDifference(departureDate, returnDate) {
  if (!departureDate || !returnDate) return 1;

  const departureDateObj = new Date(departureDate);
  const returnDateObj = new Date(returnDate);
  const timeDifference = returnDateObj.getTime() - departureDateObj.getTime();

  if (timeDifference <= 0) return 1;

  const days = timeDifference / (1000 * 60 * 60 * 24);
  return Math.ceil(days);
}

/** Legacy helper: percentage discount, floored twice exactly as before. */
function calculateDiscountedPrice(price, discountPercentage) {
  if (!price || price <= 0) return 0;
  if (!discountPercentage || discountPercentage < 0) return price;

  const originalPrice = Math.floor(price);
  const discount = (discountPercentage * originalPrice) / 100;
  return Math.floor(originalPrice - discount);
}

/**
 * Resolve the discount % for a single vehicle.
 * Mirrors the original branch:
 *   citywise rule present && citywise enabled -> max(vehicleDiscount, overall)
 *   otherwise                                 -> overall
 */
function resolveDiscount({ vehicleDiscount, hasCityRule, cityWiseDiscount, overAllDiscount }) {
  if (hasCityRule && cityWiseDiscount) {
    return Math.max(vehicleDiscount || 0, overAllDiscount || 0);
  }
  return overAllDiscount || 0;
}

/**
 * Compute the fare for one vehicle.
 *
 * @param {object} vehicle  plain object with legacy field names + attached
 *                          one_way_trip_pricings / airport_pricings /
 *                          local_rental_pricings / dham_pricings / discount_vehicles
 * @param {object} ctx      { category, carTab, tripType, distance, departureDate,
 *                            returnDate, time, taxIncluded, tollTax,
 *                            overAllDiscount, cityWiseDiscount, advancePaymentPercentage }
 */
function computeVehiclePrice(vehicle, ctx) {
  const {
    category,
    carTab,
    tripType,
    distance,
    departureDate,
    returnDate,
    time,
    taxIncluded = false,
    tollTax = 0,
    overAllDiscount = 0,
    cityWiseDiscount = false,
    advancePaymentPercentage = 0,
  } = ctx;

  let discount = 0;
  let price = 0;
  let discountPrice = 0;
  let includedKm = `${distance} Km`;

  const taxPerKm = taxIncluded ? tollTax : 0;

  const discountVehicles = vehicle.discount_vehicles || [];
  const vehicleDiscount = discountVehicles[0]?.discount || 0;

  if (category === "outstation" && carTab === "taxi") {
    /* ---------------- ONE WAY ---------------- */
    if (tripType === "oneWay" && distance) {
      const taxOneWay = Math.floor(taxPerKm * distance);

      if (Number(vehicle.minimum_price_range) >= distance) {
        price = Number(vehicle.minimum_price) + taxOneWay;
      } else if (vehicle.one_way_trip_pricings) {
        const slabs = vehicle.one_way_trip_pricings;
        const range = slabs.find((i) => distance >= i.from && distance <= i.to);

        if (range) {
          const pricePerKm = range ? parseFloat(range.price_per_km) : 0;
          price = Math.floor(distance * pricePerKm) + taxOneWay;
        } else {
          const lastRange = slabs[slabs.length - 1];
          const pricePerKm = distance > lastRange?.to ? parseFloat(lastRange.price_per_km) : 0;
          price = Math.floor(distance * pricePerKm) + taxOneWay;
        }
      }

      const hasCityRule = Boolean(discountVehicles[0]?.discount_cities);
      discount = resolveDiscount({ vehicleDiscount, hasCityRule, cityWiseDiscount, overAllDiscount });
      discountPrice = calculateDiscountedPrice(price, discount);

    /* ---------------- ROUND TRIP ---------------- */
    } else if (tripType === "roundTrip" && distance) {
      const days = calculateDaysDifference(departureDate, returnDate);

      if (days > 0 && vehicle.priceperkm) {
        const kmAsPerDays = days * 250;
        const roundTripKm = distance * 2;
        const km = roundTripKm > kmAsPerDays ? roundTripKm : kmAsPerDays;

        const taxRoundTrip = Math.floor(taxPerKm * km);
        const stateTaxRoundTrip = taxIncluded ? days * Number(vehicle.perdaystatetaxcharges || 0) : 0;

        includedKm = `${km} Km`;

        const fixedPricePerKm = vehicle.priceperkm ? parseFloat(vehicle.priceperkm) : 0;
        const fixedDriverExpenses = vehicle.driver_expences ? parseFloat(vehicle.driver_expences) : 0;

        price =
          Math.floor(km * fixedPricePerKm) +
          fixedDriverExpenses +
          taxRoundTrip +
          stateTaxRoundTrip;

        const hasCityRule = Array.isArray(discountVehicles) && discountVehicles.length > 0;
        discount = resolveDiscount({ vehicleDiscount, hasCityRule, cityWiseDiscount, overAllDiscount });
        discountPrice = calculateDiscountedPrice(price, discount);
      }
    }

  /* ---------------- LOCAL / AIRPORT ---------------- */
  } else if (category === "localairport" && carTab === "taxi") {
    if (tripType === "local" && distance) {
      if (vehicle.local_rental_pricings?.[0]) {
        price = Math.floor(vehicle.local_rental_pricings[0].price);
      }
      if (time) includedKm = `${time} hours, ${distance} Km`;
    } else if (tripType === "airport" && distance) {
      if (vehicle.airport_pricings?.[0]) {
        price = Math.floor(vehicle.airport_pricings[0].price);
      }
      includedKm = `${distance} Km`;
    }

    const hasCityRule = Boolean(discountVehicles[0]?.discount_cities);
    discount = resolveDiscount({ vehicleDiscount, hasCityRule, cityWiseDiscount, overAllDiscount });
    discountPrice = calculateDiscountedPrice(price, discount);

  /* ---------------- CHAR DHAM ---------------- */
  } else if (carTab === "chardham") {
    if (vehicle.dham_pricings?.[0]) {
      price = Math.floor(vehicle.dham_pricings[0].price);
      discount = vehicle.dham_pricings[0].discount;
      discountPrice = calculateDiscountedPrice(price, discount);
    }
  }

  const advancePrice = advancePaymentPercentage
    ? Math.round(
        discountPrice && discount > 0
          ? (discountPrice * advancePaymentPercentage) / 100
          : (price * advancePaymentPercentage) / 100
      )
    : Math.round(price);

  return {
    ...vehicle,
    computedPrice: Math.round(price),
    computedKm: includedKm,
    discount,
    discountPrice: Math.round(discountPrice),
    advancePrice,
  };
}

/** Compute for a list of vehicles and sort cheapest-first (legacy behaviour). */
function computePrices(vehicles, ctx) {
  return vehicles
    .map((v) => computeVehiclePrice(v, ctx))
    .sort((a, b) => a.computedPrice - b.computedPrice);
}

/** Tour-package totals for the Packages booking flow. */
function computeTourTotals({ cabCharge, hotelCharge = 0, rooms = 1, nights = 1, bookingChargePercent = 10 }) {
  const cab = Math.round(Number(cabCharge) || 0);
  const hotel = Math.round((Number(hotelCharge) || 0) * (rooms || 1) * (nights || 1));
  const totalPayable = cab + hotel;
  const bookingChargeAmount = Math.round((cab * (Number(bookingChargePercent) || 0)) / 100);
  return {
    cabCharge: cab,
    hotelCharge: hotel,
    totalPayable,
    bookingChargePercent: Number(bookingChargePercent) || 0,
    bookingChargeAmount,
    balanceDue: Math.max(0, totalPayable - bookingChargeAmount),
  };
}

module.exports = {
  calculateDaysDifference,
  calculateDiscountedPrice,
  computeVehiclePrice,
  computePrices,
  computeTourTotals,
};

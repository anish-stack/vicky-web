const { Discount } = require("../models");

/**
 * Resolve the active discount rule for a quote request and flatten it into the
 * shape the pricing service expects (`discount_vehicles` per vehicle).
 */
async function resolveDiscountContext({ slug, tripType, cityId, pickupPlaceId, dropPlaceId }) {
  const empty = { overAllDiscount: 0, cityWiseDiscount: false, byVehicle: new Map() };
  if (!slug) return empty;

  const now = new Date();
  const discount = await Discount.findOne({
    slug,
    isActive: true,
    $and: [
      { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
      { $or: [{ validTo: null }, { validTo: { $gte: now } }] },
    ],
  }).lean();

  if (!discount) return empty;

  const overAllDiscount =
    discount.apply_overall_discount && discount.overall_discount ? discount.overall_discount : 0;
  const cityWiseDiscount = Boolean(discount.apply_citywise_discount);

  const byVehicle = new Map();

  if (cityWiseDiscount) {
    const matched = (discount.cities || []).filter((c) => {
      const cityMatch = cityId && c.city && String(c.city) === String(cityId);

      const directMatch =
        pickupPlaceId &&
        dropPlaceId &&
        c.pickupCityPlaceId === pickupPlaceId &&
        c.dropCityPlaceId === dropPlaceId;

      const reverseMatch =
        pickupPlaceId &&
        dropPlaceId &&
        c.isBidirectional &&
        c.pickupCityPlaceId === dropPlaceId &&
        c.dropCityPlaceId === pickupPlaceId;

      return cityMatch || directMatch || reverseMatch;
    });

    for (const rule of matched) {
      if (rule.tripTypes?.length && tripType && !rule.tripTypes.includes(tripType)) continue;

      for (const dv of rule.vehicles || []) {
        if (tripType && dv.tripType !== tripType) continue;
        const key = String(dv.vehicle);
        const prev = byVehicle.get(key);
        // keep the strongest rule if a vehicle matches more than one city rule
        if (!prev || dv.discount > prev.discount) {
          byVehicle.set(key, { discount: dv.discount, discount_cities: rule });
        }
      }
    }
  }

  return { overAllDiscount, cityWiseDiscount, byVehicle, discount };
}

/** Attach `discount_vehicles` to each vehicle, matching the legacy payload shape. */
function attachDiscounts(vehicles, ctx) {
  return vehicles.map((v) => {
    const hit = ctx.byVehicle?.get(String(v.id || v._id));
    return { ...v, discount_vehicles: hit ? [hit] : [] };
  });
}

module.exports = { resolveDiscountContext, attachDiscounts };

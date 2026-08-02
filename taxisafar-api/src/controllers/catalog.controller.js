const crud = require("./_crud");
const {
  City, Airport, Vehicle, LocalRentalPlan, Destination, Service,
  Testimonial, Faq, Hotel, DhamCategory, DhamPackage, Pincode,
} = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

/** Reference-data endpoints. All public reads, writes are protected in routes. */

const cities = crud(City, { searchFields: ["name", "state"], slugFrom: "name", sort: { name: 1 } });
const airports = crud(Airport, { searchFields: ["name", "code"], slugFrom: "name", sort: { name: 1 } });
const localPlans = crud(LocalRentalPlan, { searchFields: ["label"], sort: { hours: 1 } });
const destinations = crud(Destination, { searchFields: ["title"], slugFrom: "title" });
const services = crud(Service, { searchFields: ["title"], slugFrom: "title" });
const testimonials = crud(Testimonial, { searchFields: ["name", "message"] });
const faqs = crud(Faq, { searchFields: ["question", "answer"] });
const hotels = crud(Hotel, { searchFields: ["name", "cityName"], slugFrom: "name", populate: "city" });
const dhamCategories = crud(DhamCategory, { searchFields: ["name"], slugFrom: "name" });

const vehicles = crud(Vehicle, {
  searchFields: ["title"],
  slugFrom: "title",
  populate: "one_way_trip_pricings",
  sort: { sortOrder: 1, title: 1 },
});

const dhamPackages = crud(DhamPackage, {
  searchFields: ["name"],
  slugFrom: "name",
  populate: "category",
});

/** GET /api/cities/:id/pincodes */
const cityPincodes = asyncHandler(async (req, res) => {
  const rows = await Pincode.find({ city: req.params.id }).sort({ pincode: 1 }).lean();
  return ok(res, rows, "Pincodes fetched successfully");
});

/** GET /api/cities/serviceable?pincode=110001 */
const checkServiceable = asyncHandler(async (req, res) => {
  const { pincode } = req.query;
  const row = await Pincode.findOne({ pincode, isValid: true }).populate("city").lean();
  return ok(
    res,
    { serviceable: Boolean(row), city: row?.city || null, areaName: row?.areaName || null },
    row ? "Service available in this area" : "Service not available in this area"
  );
});

/** GET /api/local-rental-plans/by-city?city=<id> — plans that actually have pricing. */
const plansByCity = asyncHandler(async (req, res) => {
  const { LocalRentalPricing } = require("../models");
  const planIds = await LocalRentalPricing.distinct("plan", { city: req.query.city });
  const plans = await LocalRentalPlan.find({ _id: { $in: planIds }, isActive: true })
    .sort({ hours: 1 })
    .lean();
  return ok(res, plans, "Plans fetched successfully");
});

module.exports = {
  cities, airports, vehicles, localPlans, destinations, services,
  testimonials, faqs, hotels, dhamCategories, dhamPackages,
  cityPincodes, checkServiceable, plansByCity,
};

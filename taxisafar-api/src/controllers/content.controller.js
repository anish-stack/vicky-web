const {
  Content, Destination, Service, Testimonial, Faq, Setting,
  Newsletter, Enquiry, DhamCategory, DhamPackage, City, LocalRentalPlan, Airport,
} = require("../models");
const crud = require("./_crud");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/response");

const pages = crud(Content, { searchFields: ["page", "title"], sort: { page: 1 } });

/**
 * GET /api/content/:page
 * One call returns every section a page needs, already hydrated with the
 * related collections, so the frontend can render fully dynamically.
 */
const getPage = asyncHandler(async (req, res) => {
  const { page } = req.params;

  const doc = await Content.findOne({ page, isActive: true }).lean({ virtuals: true });
  if (!doc) throw ApiError.notFound(`Content for page "${page}" not found`);

  doc.sections = (doc.sections || [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // hydrate the section types that read from their own collections
  const needs = new Set(doc.sections.map((s) => s.sectionType));
  const tab = req.query.tab || (page === "chardham" ? "chardham" : page === "hotel" ? "hotel" : "taxi");

  const [destinations, services, testimonials, faqs] = await Promise.all([
    needs.has("popularDestinations")
      ? Destination.find({ isActive: true, tab }).sort({ sortOrder: 1 }).limit(12).lean()
      : [],
    needs.has("services") ? Service.find({ isActive: true }).sort({ sortOrder: 1 }).lean() : [],
    needs.has("testimonials") ? Testimonial.find({ isActive: true }).sort({ sortOrder: 1 }).lean() : [],
    needs.has("faqs") ? Faq.find({ isActive: true, group: page }).sort({ sortOrder: 1 }).lean() : [],
  ]);

  for (const section of doc.sections) {
    if (section.sectionType === "popularDestinations" && !section.items?.length) section.items = destinations;
    if (section.sectionType === "services" && !section.items?.length) section.items = services;
    if (section.sectionType === "testimonials" && !section.items?.length) section.items = testimonials;
    if (section.sectionType === "faqs" && !section.items?.length) section.items = faqs;
  }

  return ok(res, doc, "Content fetched successfully");
});

/**
 * GET /api/bootstrap
 * Everything the shell + booking widget needs in a single request, so the
 * first paint does not fan out into six round-trips.
 */
const bootstrap = asyncHandler(async (req, res) => {
  const [settings, cities, plans, airports, dhamCategories, dhamPackages] = await Promise.all([
    Setting.find({ group: { $in: ["general", "contact", "social", "seo"] } }).lean(),
    City.find({ isActive: true }).select("name slug hotel airport").sort({ name: 1 }).lean(),
    LocalRentalPlan.find({ isActive: true }).sort({ hours: 1 }).lean(),
    Airport.find({ isActive: true }).select("name slug code").sort({ name: 1 }).lean(),
    DhamCategory.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    DhamPackage.find({ isActive: true })
      .select("name slug image category distance pickupCities.name pickupCities.days pickupCities._id")
      .sort({ sortOrder: 1 })
      .lean(),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return ok(
    res,
    { settings: settingsMap, cities, localRentalPlans: plans, airports, dhamCategories, dhamPackages },
    "Bootstrap data fetched successfully"
  );
});

/** GET /api/settings */
const listSettings = asyncHandler(async (req, res) => {
  const filter = req.query.group ? { group: req.query.group } : {};
  const rows = await Setting.find(filter).lean();
  return ok(res, Object.fromEntries(rows.map((s) => [s.key, s.value])), "Settings fetched successfully");
});

/** PUT /api/settings — bulk upsert, staff only. */
const updateSettings = asyncHandler(async (req, res) => {
  const entries = Object.entries(req.body || {});
  if (!entries.length) throw ApiError.badRequest("No settings supplied");

  await Promise.all(entries.map(([key, value]) => Setting.put(key, value)));
  const rows = await Setting.find().lean();
  return ok(res, Object.fromEntries(rows.map((s) => [s.key, s.value])), "Settings updated successfully");
});

/** POST /api/newsletter */
const subscribe = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw ApiError.badRequest("Please enter a valid email address");

  await Newsletter.findOneAndUpdate(
    { email },
    { email, isActive: true, source: req.body.source || "footer" },
    { upsert: true, new: true }
  );
  return created(res, { email }, "Subscribed successfully");
});

/** POST /api/enquiries — contact form and the three partner cards. */
const createEnquiry = asyncHandler(async (req, res) => {
  const { type = "contact", name, phone, email, city, subject, message, ...meta } = req.body;
  if (!name || !phone) throw ApiError.badRequest("Name and phone number are required");

  const enquiry = await Enquiry.create({ type, name, phone, email, city, subject, message, meta });
  return created(res, { id: enquiry._id }, "Thanks! We will get back to you shortly.");
});

/** GET /api/sitemap-data — slugs + timestamps for sitemap.xml generation. */
const sitemapData = asyncHandler(async (req, res) => {
  const { TourPackage } = require("../models");
  const [packages, destinations, cities, dhamPackages, services] = await Promise.all([
    TourPackage.find({ isActive: true }).select("slug updatedAt").lean(),
    Destination.find({ isActive: true }).select("slug updatedAt tab").lean(),
    City.find({ isActive: true }).select("slug updatedAt").lean(),
    DhamPackage.find({ isActive: true }).select("slug updatedAt").lean(),
    Service.find({ isActive: true }).select("slug updatedAt").lean(),
  ]);
  return ok(res, { packages, destinations, cities, dhamPackages, services }, "Sitemap data fetched");
});

module.exports = {
  pages, getPage, bootstrap, listSettings, updateSettings,
  subscribe, createEnquiry, sitemapData,
};

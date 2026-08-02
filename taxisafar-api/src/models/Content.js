const { Schema, model } = require("mongoose");
const { baseOptions, auditFields, seoSchema } = require("./_base");

/**
 * Generic page-section CMS. Every piece of website copy/imagery lives here so the
 * frontend can render fully dynamically.
 *
 * sectionType examples:
 *  hero | popularDestinations | aboutUs | featureAccordion | services
 *  testimonials | partnerCards | newsletter | footer | cta | stats
 */
const sectionSchema = new Schema(
  {
    key: { type: String, required: true },        // stable id used by the renderer
    sectionType: { type: String, required: true },
    heading: { type: String, default: "" },
    subheading: { type: String, default: "" },
    kicker: { type: String, default: "" },
    body: { type: String, default: "" },
    image: { type: String, default: null },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: null },
    ctaLabel: { type: String, default: "" },
    ctaHref: { type: String, default: "" },
    items: { type: [Schema.Types.Mixed], default: [] },
    data: { type: Schema.Types.Mixed, default: {} },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const contentSchema = new Schema(
  {
    page: { type: String, required: true, unique: true, index: true }, // home | chardham | hotel | packages | about ...
    title: { type: String, default: "" },
    sections: { type: [sectionSchema], default: [] },
    seo: { type: seoSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Content", contentSchema);

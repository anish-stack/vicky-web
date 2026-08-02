const { Schema, model } = require("mongoose");
const { baseOptions, auditFields, seoSchema } = require("./_base");

/** "Explore Popular Destination" cards — works for taxi, chardham and hotel tabs. */
const schema = new Schema(
  {
    title: { type: String, required: true },      // "Pune To Hyderabad Taxi"
    slug: { type: String, required: true, unique: true, index: true },
    subtitle: { type: String, default: "" },      // "Round Trip | 3 Days"
    image: { type: String, default: null },
    tab: { type: String, enum: ["taxi", "chardham", "hotel"], default: "taxi", index: true },
    href: { type: String, default: "" },
    fromCityName: { type: String, default: null },
    toCityName: { type: String, default: null },
    propertyCount: { type: Number, default: null },  // hotel tab: "2,919 properties"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Destination", schema);

const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

/** "Explore Our Top-Rated Services" cards. */
const schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    icon: { type: String, default: null },
    href: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Service", schema);

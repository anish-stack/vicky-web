const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    avatar: { type: String, default: null },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    message: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Testimonial", schema);

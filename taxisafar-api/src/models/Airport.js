const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    code: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Airport", schema);

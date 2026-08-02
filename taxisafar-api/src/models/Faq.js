const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    group: { type: String, default: "general", index: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    ...auditFields,
  },
  baseOptions
);

module.exports = model("Faq", schema);

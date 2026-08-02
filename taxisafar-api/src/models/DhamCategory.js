const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  {
    name: { type: String, required: true },          // "1 Dham Yatra", "2 Dham Yatra", "3 Dham Yatra"
    slug: { type: String, required: true, unique: true, index: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...auditFields,
  },
  baseOptions
);

schema.virtual("packages", { ref: "DhamPackage", localField: "_id", foreignField: "category" });

module.exports = model("DhamCategory", schema);

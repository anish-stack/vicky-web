const { Schema, model } = require("mongoose");
const { baseOptions, auditFields, seoSchema } = require("./_base");

const citySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    state: { type: String, default: null },
    airport: { type: Schema.Types.ObjectId, ref: "Airport", default: null, index: true },
    distance: { type: String, default: null },
    hotel: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    seo: { type: seoSchema, default: () => ({}) },
    ...auditFields,
  },
  baseOptions
);

citySchema.virtual("pincodes", { ref: "Pincode", localField: "_id", foreignField: "city" });

module.exports = model("City", citySchema);

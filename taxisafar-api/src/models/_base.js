const { Schema } = require("mongoose");

const baseOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
  toObject: { virtuals: true },
};

const auditFields = {
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
};

const seoSchema = new Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: [String], default: [] },
    ogImage: { type: String, default: "" },
    canonical: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false }
);

module.exports = { baseOptions, auditFields, seoSchema };

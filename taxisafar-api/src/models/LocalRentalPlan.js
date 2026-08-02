const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  {
    hours: { type: Number, required: true },
    km: { type: Number, required: true },
    label: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    ...auditFields,
  },
  baseOptions
);

schema.pre("save", function (next) {
  if (!this.label) this.label = `${this.hours} Hrs / ${this.km} Km`;
  next();
});

module.exports = model("LocalRentalPlan", schema);

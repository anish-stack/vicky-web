const { Schema, model } = require("mongoose");
const { baseOptions, auditFields } = require("./_base");

const schema = new Schema(
  { percentage: { type: Number, default: 0 }, ...auditFields },
  baseOptions
);

module.exports = model("AdvancePayment", schema);

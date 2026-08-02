const { Schema, model } = require("mongoose");
const { baseOptions } = require("./_base");

const schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: "footer" },
  },
  baseOptions
);

module.exports = model("Newsletter", schema);

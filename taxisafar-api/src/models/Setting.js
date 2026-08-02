const { Schema, model } = require("mongoose");
const { baseOptions } = require("./_base");

const schema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, default: null },
    group: { type: String, default: "general", index: true },
  },
  baseOptions
);

schema.statics.get = async function (key, fallback = null) {
  const row = await this.findOne({ key }).lean();
  return row ? row.value : fallback;
};

schema.statics.put = function (key, value, group = "general") {
  return this.findOneAndUpdate({ key }, { value, group }, { upsert: true, new: true });
};

module.exports = model("Setting", schema);

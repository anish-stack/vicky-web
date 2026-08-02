const { Schema, model } = require("mongoose");
const { baseOptions } = require("./_base");

/** Contact form + "Join Our Network" partner/driver/hotel forms. */
const schema = new Schema(
  {
    type: {
      type: String,
      enum: ["contact", "driver", "partner", "hotel", "support"],
      default: "contact",
      index: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, default: null },
    city: { type: String, default: null },
    subject: { type: String, default: null },
    message: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new", index: true },
  },
  baseOptions
);

module.exports = model("Enquiry", schema);

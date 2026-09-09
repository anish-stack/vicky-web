const mongoose = require('mongoose');

const vltdPickupLocationSchema = new mongoose.Schema({
  state: { type: String, required: true, index: true }, // e.g., "Delhi", "Uttar Pradesh"
  city: { type: String, required: true }, // e.g., "North Delhi", "Noida"
  hubName: { type: String, required: true }, // e.g., "TaxiSafar Hub Noida Sector 16"
  fullAddress: { type: String, required: true },
  contactPerson: { type: String },
  contactPhone: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('VltdPickupLocation', vltdPickupLocationSchema);
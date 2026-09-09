const mongoose = require('mongoose');

const vltdProductSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Vehicle Location Tracking Device (VLTD)" },
  subTitle: { type: String, default: "Track Your Vehicle. Anytime, Anywhere." },
  description: { type: String },
  devicePrice: { type: Number, required: true, default: 1399 },
  
  // Hero Banner: ab yahan icon ki jagah main image URL/path aayega
  heroBannerImage: { type: String, required: true },

  // Hero Banner Features preview strip (icons ke sath)
  heroBadges: [{
    icon: String,
    title: String
  }],

  // Key Features Section: icon ke sath
  keyFeatures: [{
    icon: { type: String, required: true }, // e.g. Ionicons name or image URL
    title: { type: String, required: true },
    description: String
  }],

  // Why Choose Us Section: icon ke sath
  whyChooseUs: [{
    icon: { type: String, required: true }, // e.g. Icon name or image URL
    title: { type: String, required: true },
    description: String
  }],

  // What's in the Box Section: sirf image aur name (no icon)
  boxItems: [{
    image: { type: String, required: true }, // Item photo (e.g. Device, Harness, Relay image)
    name: { type: String, required: true }   // e.g., "VLTD Device", "Wiring Harness", "Relay"
  }],

  // Recharge Plans Options
  rechargePlans: [{
    durationYears: { type: Number, required: true }, // 1 or 2
    title: { type: String, required: true }, // e.g., "1 Year Recharge"
    price: { type: Number, required: true } // e.g., 3500
  }],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('VltdProduct', vltdProductSchema);
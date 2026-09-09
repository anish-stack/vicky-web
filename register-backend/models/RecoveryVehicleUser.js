const mongoose = require('mongoose');

const recoveryVehicleSchema = new mongoose.Schema({
  // Basic Business & Profile Info
  name: { type: String, required: true }, // Operator Name (e.g., "Rohit Sharma")
  garageName: { type: String, required: true }, // Service Name (e.g., "Sharma Recovery Service")
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  
  // Images
  profileImage: { type: String },
  galleryImages: { type: [String], default: [] }, // Slider images (1/5, etc.)

  // Verification & Status Badges
  isVerifiedProvider: { type: Boolean, default: false },
  isTrusted: { type: Boolean, default: false },
  profileStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  isOpenNow: { type: Boolean, default: true },

  // Stats Bar (Experience, Recovered Vehicles, Success Rate, Availability)
  experienceYears: { type: Number, default: 0 }, // e.g., 6+ Years
  vehiclesRecoveredCount: { type: Number, default: 0 }, // e.g., 1500+
  successRatePercentage: { type: Number, default: 99 }, // e.g., 99%
  availabilitySummary: { type: String, default: "24x7 (All Days)" },

  // Rating & Reviews
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  tagline: { type: String, default: "Fast | Safe | Reliable" },

  // Location & Address
  address: {
    line1: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [Longitude, Latitude]
    }
  },

  // About Section
  about: { type: String },

  // Our Services (Breakdown Recovery, Accident Recovery, Bike Recovery, etc.)
  servicesOffered: { 
    type: [String], 
    default: ["Breakdown Recovery", "Accident Recovery", "Bike Recovery", "Jump Start Service", "Fuel Delivery"] 
  },

  // Vehicles We Recover (Hatchback, Sedan, SUV, MPV, Luxury Cars, Commercial)
  vehiclesRecoveredTypes: { 
    type: [String], 
    default: ["Hatchback", "Sedan", "SUV", "MPV", "Luxury Cars", "Commercial"] 
  },

  // Additional Details Row
  startingPrice: { type: Number, default: 899 }, // e.g., ₹899 Onwards
  serviceArea: { type: String, default: "Ghaziabad & Nearby Areas" },
  operatorName: { type: String }, // e.g., "Rohit Sharma"
  licenseNumber: { type: String }, // e.g., "UP14RT1234"

  // Settings & Flags
  callHistoryEnabled: { type: Boolean, default: true },
  whatsappHistoryEnabled: { type: Boolean, default: true },
  numberMasked: { type: Boolean, default: true },

  // OTP Verification Fields
  otp: { type: String },
  otpExpiry: { type: Date },
  isMobileVerified: { type: Boolean, default: false }

}, { timestamps: true });

// Index for Geospatial queries ($near)
recoveryVehicleSchema.index({ "address.location": "2dsphere" });
// Text index for search functionality
recoveryVehicleSchema.index({ garageName: "text", name: "text", "address.city": "text" });

module.exports = mongoose.model('RecoveryVehicleUser', recoveryVehicleSchema);
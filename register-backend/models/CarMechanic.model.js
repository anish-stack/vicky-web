const mongoose = require("mongoose");
const { SERVICE_TITLES, BRAND_TITLES, VEHICLE_TITLES, FACILITY_TITLES } = require("../constants/mechanicOptions");

const workingHoursSchema = new mongoose.Schema({
    day: { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], required: true },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "20:00" }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const carMechanicUserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, select: false },

    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },

    profileImage: { type: String },
    coverImage: { type: String },
    galleryImages: { type: [String], default: [] },

    garageName: { type: String, required: true, trim: true },
    isVerifiedMechanic: { type: Boolean, default: false },
    isTrusted: { type: Boolean, default: false },
    experienceYears: { type: Number, default: 0 },

    address: {
        line1: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        }
    },

    workingHours: { type: [workingHoursSchema], default: [] },
    isOpenNow: { type: Boolean, default: true },

    specialty: { type: String, trim: true, default: "All Types of Car Repair & Service" },

    servicesOffered: { type: [{ type: String, enum: SERVICE_TITLES }], default: [] },
    brandsServiced: { type: [{ type: String, enum: BRAND_TITLES }], default: [] },
    vehicleTypesServiced: { type: [{ type: String, enum: VEHICLE_TITLES }], default: [] },
    facilities: { type: [{ type: String, enum: FACILITY_TITLES }], default: [] },

    about: { type: String, trim: true },
    whyChooseUs: { type: [String], default: [] },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },

    callHistoryEnabled: { type: Boolean, default: true },
    whatsappHistoryEnabled: { type: Boolean, default: true },
    numberMasked: { type: Boolean, default: true },

    profileStatus: {
        type: String,
        enum: ["active", "blocked", "hidden"],
        default: "active"
    },
    statusReason: { type: String, trim: true },
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    statusUpdatedAt: { type: Date },

    isOnline: { type: Boolean, default: false },

}, { timestamps: true });

carMechanicUserSchema.index({ "address.location": "2dsphere" });
carMechanicUserSchema.index({ phone: 1 }, { unique: true });
carMechanicUserSchema.index({ garageName: "text", specialty: "text" });

module.exports = mongoose.model("CarMechanicUser", carMechanicUserSchema);
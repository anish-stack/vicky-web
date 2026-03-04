const mongoose = require("mongoose");

const socialSchema = new mongoose.Schema(
    {
        facebook: { type: String },
        instagram: { type: String },
        youtube: { type: String },
        website: { type: String },
        whatsapp: { type: String }
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true
        },

        profileImage: {
            type: String
        },

        category: {
            type: String,
            enum: [
                "tour_guide",
                "rto_service",
                "car_accessory",
                "car_mechanic"
            ],
            required: true
        },

        description: {
            type: String
        },

        city: {
            type: String
        },

        state: {
            type: String
        },

        address: {
            type: String
        },

        isPaid: {
            type: Boolean,
            default: false
        },

        verifiedByAdmin: {
            type: Boolean,
            default: false
        },

        rating: {
            type: Number,
            default: 0
        },

        totalReviews: {
            type: Number,
            default: 0
        },

        // ===============================
        // MOBILE OTP VERIFICATION
        // ===============================

        otp: {
            type: String
        },

        otpExpires: {
            type: Date
        },

        otpAttempts: {
            type: Number,
            default: 0
        },

        isMobileVerified: {
            type: Boolean,
            default: false
        },
        // ===============================
        // SOCIAL LINKS (ALL USERS)
        // ===============================

        socialLinks: socialSchema,



        // ===============================
        // TOUR GUIDE
        // ===============================

        experienceYears: {
            type: Number,
            required: function () {
                return this.category === "tour_guide"
            }
        },

        languages: {
            type: [String],
            required: function () {
                return this.category === "tour_guide"
            }
        },

        guideLicenseNumber: {
            type: String
        },

        servicesOffered: {
            type: [String] // trekking, city tour, wildlife tour
        },

        tourImages: {
            type: [String]
        },



        // ===============================
        // RTO SERVICE
        // ===============================

        officeName: {
            type: String,
            required: function () {
                return this.category === "rto_service"
            }
        },

        officeAddress: {
            type: String,
            required: function () {
                return this.category === "rto_service"
            }
        },

        services: {
            type: [String] // driving license, rc transfer etc
        },



        // ===============================
        // CAR ACCESSORY SHOP
        // ===============================

        shopName: {
            type: String,
            required: function () {
                return this.category === "car_accessory"
            }
        },

        shopAddress: {
            type: String
        },

        accessoryTypes: {
            type: [String] // seat cover, music system etc
        },

        shopImages: {
            type: [String]
        },



        // ===============================
        // CAR MECHANIC
        // ===============================

        garageName: {
            type: String,
            required: function () {
                return this.category === "car_mechanic"
            }
        },

        garageAddress: {
            type: String
        },

        mechanicExperience: {
            type: Number
        },

        specialization: {
            type: [String] // engine repair, electrical etc
        },

        garageImages: {
            type: [String]
        }

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("User", userSchema);
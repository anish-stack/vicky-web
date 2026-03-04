const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        number: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            enum: ["hotel", "tour_guide", "rto_service", "insurance", "car_accessory", "car_mechanic"],
            required: true
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        verifiedByAdmin: {
            type: Boolean,
            default: false
        },
        // ===============================
        // 🔹 TOUR GUIDE FIELDS
        // ===============================

        experienceYears: {
            type: Number,
            required: function () {
                return this.category === "tour_guide";
            },
        },

        languages: {
            type: [String],
            required: function () {
                return this.category === "tour_guide";
            },
        },

        pricePerDay: {
            type: Number,
            required: function () {
                return this.category === "tour_guide";
            },
        },

        location: {
            type: String,
            required: function () {
                return this.category === "tour_guide";
            },
        },

        // ===============================
        // 🔹 RTO SERVICE FIELDS
        // ===============================

        servicesOffered: {
            type: [String],
            required: function () {
                return this.category === "rto_service";
            },
        },

        officeAddress: {
            type: String,
            required: function () {
                return this.category === "rto_service";
            },
        },

        serviceCharge: {
            type: Number,
            required: function () {
                return this.category === "rto_service";
            },
        },

        // ===============================
        // 🔹 CAR MECHANIC FIELDS
        // ===============================

        garageName: {
            type: String,
            required: function () {
                return this.category === "car_mechanic";
            },
        },

        garageAddress: {
            type: String,
            required: function () {
                return this.category === "car_mechanic";
            },
        },

        mechanicExperience: {
            type: Number,
            required: function () {
                return this.category === "car_mechanic";
            },
        },

        emergencyService: {
            type: Boolean,
            required: function () {
                return this.category === "car_mechanic";
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
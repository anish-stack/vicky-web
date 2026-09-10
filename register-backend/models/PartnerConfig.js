const mongoose = require("mongoose");

const partnerConfigSchema = new mongoose.Schema(
    {
        partner_screen_name: {
            type: String,
            trim: true,
            required: true
        },

        audioUrl: {
            type: String,
            trim: true,
            default: null
        },

        image_url: {
            type: String,
            trim: true,
            default: null
        },

        code_to_copy: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "PartnerConfig",
    partnerConfigSchema
);

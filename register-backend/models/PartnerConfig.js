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

        // OLD FIELD - as it is rakha hai (purane records/apps ke liye)
        image_url: {
            type: String,
            trim: true,
            default: null
        },

        // NEW FIELD - multiple images with position
        images: [
            {
                url: {
                    type: String,
                    trim: true,
                    required: true
                },
                position: {
                    type: Number,
                    required: true,
                    default: 0
                }
            }
        ],

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


const BASE_URL = "http://192.168.1.13:5001";

const withBase = (u) =>
    !u ? u
        : /^(https?:)?\/\//i.test(u) ? u
            : `${BASE_URL}${u.startsWith("/") ? "" : "/"}${u}`;

partnerConfigSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.image_url = withBase(ret.image_url);
        ret.audioUrl = withBase(ret.audioUrl);
        if (Array.isArray(ret.images)) {
            ret.images = ret.images.map((i) => ({ ...i, url: withBase(i.url) }));
        }
        return ret;
    }
});
module.exports = mongoose.model("PartnerConfig", partnerConfigSchema);
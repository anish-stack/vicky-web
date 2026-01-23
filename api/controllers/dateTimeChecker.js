
const Joi = require('joi');

// const moment = require('moment-timezone');

exports.checkTime = async (req, res) => {
    try {
        const { pickUpDateTime, dropDateTime } = req.body;

        const schema = Joi.object({
            pickUpDateTime: Joi.date()
                .iso()
                .required()
                .custom((value, helpers) => {
                    const now = new Date();
                    const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                    const minTime = new Date(istNow.getTime() + 3 * 60 * 60 * 1000);

                    if (new Date(value) < minTime) {
                        return helpers.message(
                            "Pickup Date Time must be at least 3 hours from the current IST time."
                        );
                    }
                    return value;
                })
                .messages({
                    "date.base": "Pickup Date Time must be a valid date.",
                    "date.isoDate": "Pickup Date Time must be in ISO format.",
                    "any.required": "Pickup Date Time is required.",
                }),
            dropDateTime: Joi.date()
                .iso()
                .allow('', null)
                .custom((value, helpers) => {
                    if (!value) {
                        return value;
                    }

                    const { pickUpDateTime } = helpers.state.ancestors[0];
                    const pickUpTime = new Date(pickUpDateTime);
                    const dropTime = new Date(value);

                    const minDropTime = new Date(pickUpTime.getTime() + 1 * 60 * 60 * 1000);
                    if (dropTime < minDropTime) {
                        return helpers.message("Drop Date Time must be at least 1 hour after Pickup Date Time.");
                    }

                    return value;
                })
                .messages({
                    "date.base": "Drop Date Time must be a valid date.",
                    "date.isoDate": "Drop Date Time must be in ISO format.",
                    "any.required": "Drop Date Time is required.",
                }),
        });

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const customMessages = error.details.map((err) => {
                return err.message.replace(/['"]+/g, "");
            });

            return res.json({
                status: false,
                message: customMessages.join(", "),
            });
        }

        res.status(200).json({
            status: true,
            message: "Valid time",
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


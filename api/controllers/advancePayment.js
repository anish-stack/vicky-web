const Joi = require('joi');
const { advancePayments,Setting } = require("../models");


exports.create = async (req, res) => {
    try {
			const { percentage, toll_tax, roundtrip_toll_tax } = req.body;

			const validationSchema = Joi.object({
				percentage: Joi.number().required().messages({
					"number.base": "Percentage must be a number",
					"any.required": "Percentage is required",
				}),
			}).unknown(true);

			const { error } = validationSchema.validate(
				{ ...req.body },
				{ abortEarly: false }
			);
			if (error) {
				return res.json({
					status: false,
					message: error.details.map((err) => err.message).join(", "),
				});
			}

			let data = await advancePayments.findOne();

			if (data) {
				await data.update({ percentage });
				message = "Percentage Updated Successfully";
			} else {
				data = await advancePayments.create({ percentage });
				message = "Percentage Added Successfully";
			}

			// Create or update a setting
			await Setting.upsert({
				key: "toll_tax",
				value: toll_tax,
			});
			await Setting.upsert({
				key: "roundtrip_toll_tax",
				value: roundtrip_toll_tax,
			});

			res.status(200).json({
				status: true,
				data: data,
				message: "Percentage Added Successfully",
			});
		} catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.get = async (req, res) => {
    try {
			const data = await advancePayments.findOne({});
			// Get a setting
			const settings = await Setting.findAll({
				where: {
					key: ["toll_tax", "roundtrip_toll_tax"],
				},
			});

			const toll_tax = settings.find(
				(s) => s.key === "toll_tax"
			)?.value;
			const roundtrip_toll_tax = settings.find(
				(s) => s.key === "roundtrip_toll_tax"
			)?.value;
console.log("data", data.percentage, toll_tax, roundtrip_toll_tax);
			res.status(200).json({
				status: true,
				data: {
					percentage: data.percentage,
					toll_tax,
					roundtrip_toll_tax,
				},

				message: "Advance Payment fetched successfully",
			});
		} catch (error) {
        console.error("Error fetching Cities:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
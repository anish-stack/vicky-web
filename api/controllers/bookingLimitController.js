const { BookingLimit, cities, Trip, Pincode } = require("../models");
const { Op, where, fn, col } = require("sequelize");
const Joi = require("joi");
const moment = require("moment"); 
// const Pincode = require("../models/Pincode");


exports.getBookingLimit = async (req, res) => {
	try {
		const { cityId, vehicleId, date } = req.query;
		const limit = await BookingLimit.findOne({
			where: {
				city_id: cityId,
				vehicle_id: vehicleId,
				[Op.or]: [{ limit_date: date }, { limit_date: null }],
			},
			order: [
				// Prioritize specific date first
				[
					sequelize.literal(`CASE WHEN limit_date IS NULL THEN 1 ELSE 0 END`),
					"ASC",
				],
			],
		});

		return limit ? limit.max_limit : null;
	} catch (error) {
		console.error("Error fetching Cities:", error);
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
}

exports.update = async (req, res) => {
	try {
		const { id: city_id, booking_limits } = req.body;

		const schema = Joi.object({
			id: Joi.number().required(),
			booking_limits: Joi.array()
				.items(
					Joi.object({
						id: Joi.number().allow(null),
						vehicle_id: Joi.number().required(),
						limit_date: Joi.date().required(),
						max_limit: Joi.number().integer().min(1).required(),
					}).unknown(true)
				)
				.min(1)
				.required(),
		}).unknown(true);

		const { error } = schema.validate(req.body);

		if (error) {
			return res
				.status(200)
				.json({ status: false, message: error.details[0].message });
		}
		// Step 1: Check for duplicates in input
		const seen = new Set();
		for (const limit of booking_limits) {
			const key = `${city_id}-${limit.vehicle_id}-${limit.limit_date}`;
			if (seen.has(key)) {
				return res.status(200).json({
					status: false,
					message: `Duplicate entries in input for vehicle_id: ${limit.vehicle_id} on date: ${limit.limit_date}`,
				});
			}
			seen.add(key);
		}

		// Step 2: Check for duplicates in DB
		const inputWithoutIds = booking_limits.filter((l) => !l.id);
		if (inputWithoutIds.length > 0) {
			const orConditions = inputWithoutIds.map((limit) => ({
				city_id,
				vehicle_id: limit.vehicle_id,
				limit_date: limit.limit_date,
			}));

			const existingRecords = await BookingLimit.findAll({
				where: {
					[Op.or]: orConditions,
				},
			});

			if (existingRecords.length > 0) {
				const conflict = existingRecords[0];
				return res.status(200).json({
					status: false,
					message: `Duplicate booking already exists for vehicle_id: ${conflict.vehicle_id} on date: ${conflict.limit_date}`,
				});
			}
		}

		const existingLimits = await BookingLimit.findAll({
			where: { city_id },
		});

		const existingIds = existingLimits.map((item) => item.id);

		const incomingIds = booking_limits
			.filter((item) => item.id !== null && item.id !== undefined)
			.map((item) => item.id);

		// 1. Delete records that are not in the new list
		const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));
		if (idsToDelete.length > 0) {
			await BookingLimit.destroy({
				where: {
					id: idsToDelete,
				},
			});
		}

		const updatedRecords = [];
		const createdRecords = [];

		for (const limit of booking_limits) {
			if (limit.id) {
				// 2. Update existing record
				const updated = await BookingLimit.update(
					{
						vehicle_id: limit.vehicle_id,
						limit_date: limit.limit_date,
						max_limit: limit.max_limit,
					},
					{ where: { id: limit.id } }
				);
				updatedRecords.push(limit.id);
			} else {
				// 3. Create new record
				const newLimit = await BookingLimit.create({
					city_id,
					vehicle_id: limit.vehicle_id,
					limit_date: limit.limit_date,
					max_limit: limit.max_limit,
				});
				createdRecords.push(newLimit);
			}
		}

		res.status(200).json({
			status: true,
			message: "Booking limits updated successfully",
			data: {
				updated: updatedRecords.length,
				created: createdRecords.length,
				deleted: idsToDelete.length,
			},
		});
	} catch (error) {
		console.error("error", error);
		res.status(500).json({ status: false, message: error.message });
	}
};

exports.getById = async (req, res) => {
	try {
		const { id } = req.params;
		// const data = await cities.findByPk(id);
		const data = await cities.findByPk(id, {
			include: [
				{
					model: BookingLimit,
					as: "booking_limits", // Use alias only if you defined it
				},
			],
		});
		if (data) {
			res.status(200).json({
				status: true,
				data: data,
				message: "City Details Fetched",
			});
		} else {
			res.status(404).json({
				status: false,
				message: "City Not Found",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};


exports.checkBookingAvailable = async (req, res) => {
	try {
		const { pincode, vehicle_id, departure_date } = req.body;

		if (!pincode || !vehicle_id || !departure_date) {
			return res.status(200).json({
				status: false,
				message: "pincode, vehicle_id, and departure_date are required",
			});
		}
		// 1. find city id from pincode
		let city = await Pincode.findOne({
			where: {
				pincode,
			},
		});
		const city_id = city.city_id;
		// 1. Check if a limit exists for this city, vehicle, and date
		let bookingLimit = await BookingLimit.findOne({
			where: {
				city_id,
				vehicle_id,
				limit_date: departure_date,
			},
		});

		// 2. If no date-specific limit found, fallback to limit with NULL date
		if (!bookingLimit) {
			bookingLimit = await BookingLimit.findOne({
				where: {
					city_id,
					vehicle_id,
					limit_date: {
						[Op.is]: null,
					},
				},
			});
		}

		if (!bookingLimit) {
			return res.status(200).json({
				status: true,
				available: true,
				message:
					"No limit defined for this city and vehicle, booking is allowed",
			});
		}

		// 3. Count current bookings for the same date, city, and vehicle
		const formattedLimitDate = departure_date.split("T")[0]; // "2025-05-13"

		const bookingCount = await Trip.count({
			include: [
				{
					model: Pincode,
					as: "pincode_details", // alias, optional
					where: { city_id },
					required: true,
				},
			],
			where: {
				vehicle_id,
				// departure_date,
				[Op.and]: [
					// where(fn("DATE", col("departure_date")), departure_date), // compare only the date
					where(fn("DATE", col("departure_date")), formattedLimitDate),
				],
			},
		});

		// 4. Compare with max limit
		if (bookingCount >= bookingLimit.max_limit) {
			return res.status(200).json({
				status: false,
				available: false,
				data: {
					limit: bookingLimit.max_limit,
					current: bookingCount,
				},
				message: "Oops! Booking limit reached for this vehicle on that date",
			});
		}

		// 5. Allow booking
		return res.status(200).json({
			status: true,
			available: true,
			message: "Booking is allowed",
			data: {
				limit: bookingLimit.max_limit,
				current: bookingCount,
			},
		});
	} catch (error) {
		console.error("Error checking booking availability:", error);
		return res.status(500).json({
			status: false,
			message: "Internal server error",
		});
	}
};

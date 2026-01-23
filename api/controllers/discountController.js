const Joi = require("joi");
const {
	Discount,
	DiscountCity,
	DiscountTripType,
	DiscountVehicle,
} = require("../models");
const fs = require("fs");
const { Sequelize, Op, QueryTypes } = require("sequelize");
const sequelize = require("../config/database");

exports.createOrUpdate = async (req, res) => {
	try {
		const {
			title,
			slug,
			discount_cities,
			overall_discount,
			apply_overall_discount,
			apply_citywise_discount,
		} = req.body;

		if (!slug) {
			return res.status(200).json({
				status: false,
				message: "Slug is required",
			});
		}

		const validationSchema = Joi.object({
			title: Joi.string().required().messages({
				"string.empty": "Title is required",
				"any.required": "Title is required",
			}),
		}).unknown(true);

		const { error } = validationSchema.validate(req.body, {
			abortEarly: false,
		});

		if (error) {
			return res.json({
				status: false,
				message: error.details.map((err) => err.message).join(", "),
			});
		}

		const existingRecord = await Discount.findOne({
			where: { slug: slug },
		});

		if (existingRecord) {
			await Discount.update(
				{
					title,
					overall_discount,
					apply_overall_discount,
					apply_citywise_discount,
				},
				{ where: { id: existingRecord.id } }
			);

			await DiscountCity.destroy({ where: { discount_id: existingRecord.id } });

			if (Array.isArray(discount_cities) && discount_cities.length > 0) {
				let cityRecords = [];

				discount_cities.forEach((discount_city) => {
					cityRecords.push({
						pickup_city_name: discount_city.pickup_city_name,
						pickup_city_place_id: discount_city.pickup_city_place_id,
						drop_city_name: discount_city.drop_city_name,
						drop_city_place_id: discount_city.drop_city_place_id,
						is_bidirectional: discount_city.is_bidirectional,
						city_id: discount_city.city_id,
						discount_id: existingRecord.id,
					});
				});

				const insertedCities = await DiscountCity.bulkCreate(cityRecords, {
					returning: true,
				});

				for (
					let cityIndex = 0;
					cityIndex < insertedCities.length;
					cityIndex++
				) {
					const city = insertedCities[cityIndex];
					const tripTypes =
						discount_cities[cityIndex].discount_trip_types || [];

					for (let triptype of tripTypes) {
						if (
							Array.isArray(triptype.discount_vehicles) &&
							triptype.discount_vehicles.length > 0
						) {
							let vehicleRecords = triptype.discount_vehicles.map(
								(vehicle) => ({
									vehicle_id: vehicle.vehicle_id,
									discount: vehicle.discount,
									discount_city_id: city.id,
									trip_type: triptype.trip_type,
								})
							);

							await DiscountVehicle.bulkCreate(vehicleRecords);
						}
					}
				}
			}

			return res.status(200).json({
				status: true,
				message: "Discount Updated Successfully",
			});
		} else {
			const newRecord = await Discount.create({
				title,
				slug,
				overall_discount,
				apply_overall_discount,
				apply_citywise_discount,
			});

			if (discount_cities) {
				if (Array.isArray(discount_cities) && discount_cities.length > 0) {
					let cityRecords = [];

					discount_cities.forEach((discount_city) => {
						cityRecords.push({
							pickup_city_name: discount_city.pickup_city_name,
							pickup_city_place_id: discount_city.pickup_city_place_id,
							drop_city_name: discount_city.drop_city_name,
							drop_city_place_id: discount_city.drop_city_place_id,
							is_bidirectional: discount_city.is_bidirectional,
							city_id: discount_city.city_id,
							discount_id: newRecord.id,
						});
					});

					const insertedCities = await DiscountCity.bulkCreate(cityRecords, {
						returning: true,
					});

					for (
						let cityIndex = 0;
						cityIndex < insertedCities.length;
						cityIndex++
					) {
						const city = insertedCities[cityIndex];
						const tripTypes =
							discount_cities[cityIndex].discount_trip_types || [];

						for (let triptype of tripTypes) {
							if (
								Array.isArray(triptype.discount_vehicles) &&
								triptype.discount_vehicles.length > 0
							) {
								let vehicleRecords = triptype.discount_vehicles.map(
									(vehicle) => ({
										vehicle_id: vehicle.vehicle_id,
										discount: vehicle.discount,
										discount_city_id: city.id,
										trip_type: triptype.trip_type,
									})
								);

								await DiscountVehicle.bulkCreate(vehicleRecords);
							}
						}
					}
				}
			}

			return res.status(200).json({
				status: true,
				data: newRecord,
				message: "Discount Created Successfully",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getFirstRecord = async (req, res) => {
	try {
		if (!req.query.slug) {
			return res.status(200).json({
				status: false,
				message: "Slug is required",
			});
		}

		const data = await Discount.findOne({
			where: { slug: req.query.slug },
			include: [
				{
					model: DiscountCity,
					as: "discount_cities",
					include: [
						{
							model: DiscountVehicle,
							as: "discount_vehicles",
						},
					],
				},
			],
		});

		if (data) {
			const formattedCities = data.discount_cities.map((city) => {
				const discountTripTypes = Object.values(
					city.discount_vehicles.reduce((acc, vehicle) => {
						if (!acc[vehicle.trip_type]) {
							acc[vehicle.trip_type] = {
								id: vehicle.id,
								discount_city_id: city.id,
								trip_type: vehicle.trip_type,
								discount_vehicles: [],
							};
						}
						acc[vehicle.trip_type].discount_vehicles.push({
							id: vehicle.id,
							vehicle_id: vehicle.vehicle_id,
							discount: vehicle.discount,
						});
						return acc;
					}, {})
				);

				return {
					id: city.id,
					discount_id: city.discount_id,
					city_id: city.city_id,
					pickup_city_name: city.pickup_city_name,
					pickup_city_place_id: city.pickup_city_place_id,
					drop_city_name: city.drop_city_name,
					drop_city_place_id: city.drop_city_place_id,
					is_bidirectional: city.is_bidirectional,
					discount_trip_types: discountTripTypes,
				};
			});

			res.status(200).json({
				status: true,
				data: { ...data.toJSON(), discount_cities: formattedCities },
				message: "Discount Details Fetched",
			});
		} else {
			res.status(404).json({
				status: false,
				message: "No Discount Record Found",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

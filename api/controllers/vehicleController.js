const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const { Vehicle, OneWayTripPricing, LocalRentalPricing, AirportPricing, DhamPricing, DiscountVehicle, DiscountTripType, DiscountCity, Discount } = require('../models');
const fs = require('fs');
const { Sequelize, Op, fn, col, literal } = require('sequelize');


exports.createVehicle = async (req, res) => {
    try {
        const {
					title,
					priceperkm,
					fuelcharges,
					drivercharges,
					nightcharges,
					terms,
					// one_way_trip_pricings,
					one_way_trip_pricings: rawTripPricings,
					minimum_price,
					minimum_price_range,
					extra_fare_km,
					driver_expences,
					parkingcharges,
					passengers,
					large_size_bag,
					medium_size_bag,
					hand_bag,
					ac_cab,
					luggage,
					createdBy,
					perdaystatetaxcharges,
				} = req.body;

        let one_way_trip_pricings = [];
        if (rawTripPricings) {
            try {
                one_way_trip_pricings = JSON.parse(rawTripPricings);
            } catch (err) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid JSON format for one_way_trip_pricings',
                });
            }
        }

        const vehicleSchema = Joi.object({
            title: Joi.string().required().messages({
                'string.empty': 'Title is required',
                'any.required': 'Title is required',
            }),
            priceperkm: Joi.number().precision(2).required().messages({
                'number.base': 'Price per km must be a number',
                'any.required': 'Price per km is required',
            }),
            fuelcharges: Joi.boolean().default(false),
            drivercharges: Joi.boolean().default(false),
            nightcharges: Joi.boolean().default(false),
            parkingcharges: Joi.boolean().default(false),
            terms: Joi.string().required().messages({
                'string.empty': 'Terms are required',
                'any.required': 'Terms are required',
            }),
            minimum_price: Joi.string().required().messages({
                'string.empty': 'Minimum Price is required',
                'any.required': 'Minimum Price is required',
            }),
            minimum_price_range: Joi.string().required().messages({
                'string.empty': 'Minimum Price Range is required',
                'any.required': 'Minimum Price Range is required',
            }),
            extra_fare_km: Joi.string().required().messages({
                'string.empty': 'Extra fare Km is required',
                'any.required': 'Extra fare Km is required',
            }),
            driver_expences: Joi.string().required().messages({
                'string.empty': 'Driver Expences is required',
                'any.required': 'Driver Expences is required',
            }),
            createdBy: Joi.string().optional(),
            one_way_trip_pricings: Joi.array()
                .items(
                    Joi.object({
                        vehicle_id: Joi.number().integer().optional(),
                        from: Joi.number().integer().required(),
                        to: Joi.number().integer().required(),
                        price_per_km: Joi.string().required(),
                        id: Joi.number().integer().optional(),
                        createdBy: Joi.string().allow(null).optional(),
                        updatedBy: Joi.string().allow(null).optional(),
                        createdAt: Joi.string().optional(),
                        updatedAt: Joi.string().optional()
                    })
                )
                .optional(),
        }).unknown(true);

        const { error } = vehicleSchema.validate(
            { ...req.body, one_way_trip_pricings },
            { abortEarly: false }
        );
        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details.map((err) => err.message).join(', '),
            });
        }

        const folderPath = path.join(__dirname, '../public/vehicle');

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: 'Image is required',
            });
        }

        const vehicle = await Vehicle.create({
            image: req.file.filename,
            title,
            priceperkm,
            fuelcharges,
            drivercharges,
            nightcharges,
            terms,
            minimum_price,
            minimum_price_range,
            extra_fare_km,
            parkingcharges,
            driver_expences,
            passengers,
            large_size_bag,
            medium_size_bag,
            hand_bag,
            ac_cab,
            luggage,
            perdaystatetaxcharges,
            createdBy,
        });

        if (one_way_trip_pricings) {
            const tripPricings = one_way_trip_pricings.map((pricing) => ({
                ...pricing,
                vehicle_id: vehicle.id,
            }));

            await OneWayTripPricing.bulkCreate(tripPricings);
        }

        res.status(200).json({
            status: true,
            data: vehicle,
            message: 'Vehicle Created Successfully',
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.updateVehicle = async (req, res) => {

    try {
        const { id } = req.params;
        const {
					title,
					priceperkm,
					fuelcharges,
					drivercharges,
					nightcharges,
					terms,
					updatedBy,
					one_way_trip_pricings: rawTripPricings,
					minimum_price,
					minimum_price_range,
					extra_fare_km,
					driver_expences,
					parkingcharges,
					passengers,
					large_size_bag,
					medium_size_bag,
					hand_bag,
					ac_cab,
					luggage,
					perdaystatetaxcharges,
					additional_time_charge,
				} = req.body;

        let one_way_trip_pricings = [];
        if (rawTripPricings) {
            try {
                one_way_trip_pricings = JSON.parse(rawTripPricings);
            } catch (err) {
                return res.status(400).json({
                    status: false,
                    message: 'Invalid JSON format for one_way_trip_pricings',
                });
            }
        }

        const vehicleSchema = Joi.object({
					title: Joi.string().required().messages({
						"string.empty": "Title is required",
						"any.required": "Title is required",
					}),
					priceperkm: Joi.number().precision(2).required().messages({
						"number.base": "Price per km must be a number",
						"any.required": "Price per km is required",
					}),
					fuelcharges: Joi.boolean().default(false),
					drivercharges: Joi.boolean().default(false),
					nightcharges: Joi.boolean().default(false),
					parkingcharges: Joi.boolean().default(false),
					terms: Joi.string().required().messages({
						"string.empty": "Terms are required",
						"any.required": "Terms are required",
					}),
					minimum_price: Joi.string().required().messages({
						"string.empty": "Minimum Price is required",
						"any.required": "Minimum Price is required",
					}),
					minimum_price_range: Joi.string().required().messages({
						"string.empty": "Minimum Price Range is required",
						"any.required": "Minimum Price Range is required",
					}),
					extra_fare_km: Joi.string().required().messages({
						"string.empty": "Extra fare Km is required",
						"any.required": "Extra fare Km is required",
					}),
					driver_expences: Joi.string().required().messages({
						"string.empty": "Driver Expences is required",
						"any.required": "Driver Expences is required",
					}),
					image: Joi.string().optional(),
					updatedBy: Joi.string().optional(),
					additional_time_charge: Joi.number()
                    .precision(2)
                    .min(0)
                    .required()
                    .messages({
                        "number.base": "Additional time charge must be a number",
                        "number.min": "Additional time charge cannot be negative",
                        "any.required": "Additional time charge is required",
                    }),
					one_way_trip_pricings: Joi.array()
						.items(
							Joi.object({
								vehicle_id: Joi.number().integer().optional(),
								from: Joi.number().integer().required(),
								to: Joi.number().integer().required(),
								price_per_km: Joi.string().required(),
								id: Joi.number().integer().optional(),
								createdBy: Joi.string().allow(null).optional(),
								updatedBy: Joi.string().allow(null).optional(),
								createdAt: Joi.string().optional(),
								updatedAt: Joi.string().optional(),
							})
						)
						.optional(),
				}).unknown(true);

        const { error } = vehicleSchema.validate(
            { ...req.body, one_way_trip_pricings },
            { abortEarly: false }
        );
        if (error) {
            return res.status(400).json({
                status: false,
                message: error.details.map((err) => err.message).join(', '),
            });
        }

        const vehicle = await Vehicle.findByPk(id);
        if (!vehicle) {
            return res.status(404).json({
                status: false,
                message: 'Vehicle not found',
            });
        }

        if (req.file) {
            const existingImagePath = path.join(__dirname, '../public/vehicle', vehicle.image);
            if (fs.existsSync(existingImagePath)) {
                fs.unlinkSync(existingImagePath);
            }
            vehicle.image = req.file.filename;
        }

        vehicle.title = title;
        vehicle.priceperkm = priceperkm;
        vehicle.fuelcharges = fuelcharges;
        vehicle.drivercharges = drivercharges;
        vehicle.nightcharges = nightcharges;
        vehicle.terms = terms;
        vehicle.minimum_price = minimum_price;
        vehicle.minimum_price_range = minimum_price_range;
        vehicle.extra_fare_km = extra_fare_km;
        vehicle.driver_expences = driver_expences;
        vehicle.parkingcharges = parkingcharges;
        vehicle.passengers = passengers;
        vehicle.large_size_bag = large_size_bag;
        vehicle.medium_size_bag = medium_size_bag;
        vehicle.hand_bag = hand_bag;
        vehicle.ac_cab = ac_cab;
        vehicle.luggage = luggage;
        vehicle.updatedBy = updatedBy;
        vehicle.perdaystatetaxcharges = perdaystatetaxcharges;
        vehicle.additional_time_charge = additional_time_charge;

        await vehicle.save();

        if (one_way_trip_pricings) {
            await OneWayTripPricing.destroy({ where: { vehicle_id: id } });

            const bulkData = one_way_trip_pricings.map((pricing) => ({
                ...pricing,
                vehicle_id: vehicle.id,
            }));

            await OneWayTripPricing.bulkCreate(bulkData);
        }

        res.status(200).json({
            status: true,
            data: vehicle,
            message: 'Vehicle Updated Successfully',
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Vehicle.findByPk(id);
        if (data) {
            const oneWayTripPricings = await OneWayTripPricing.findAll({
                where: {
                    vehicle_id: id,
                },
            });
            const response = {
                ...data.toJSON(),
                one_way_trip_pricings: oneWayTripPricings,
            };
            res.status(200).json({
                status: true,
                data: response,
                message: 'Vehicle Details Fetched'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Vehicle Not Found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};


exports.getAll = async (req, res) => {
    try {
        const {
            page = 1,
            items_per_page,
            search = "",
        } = req.query;

        const totalCount = await Vehicle.count();

        const pageNumber = parseInt(page, 10);
        const itemsPerPage = items_per_page ? parseInt(items_per_page, 10) : totalCount;

        const localWhereCondition = {};
        if (req.query.local_rental_plan_id && req.query.city_id) {
            localWhereCondition.local_rental_plan_id = req.query.local_rental_plan_id;
            localWhereCondition.city_id = req.query.city_id;
        }
        const airportWhereCondition = {};
        if (req.query.airport_id && req.query.city_id) {
            airportWhereCondition.airport_id = req.query.airport_id;
            airportWhereCondition.city_id = req.query.city_id;
        }

        const dhamWhereCondition = {};
        if (req.query.dham_pickup_city_id) {
            dhamWhereCondition.dham_pickup_city_id = req.query.dham_pickup_city_id;
        }

        const discountTripTypeCondition = {};
        if (req.query.discount_trip_type) {
            discountTripTypeCondition.trip_type = req.query.discount_trip_type;
        }

        const discountCityIdCondition = {};
        if (req.query.discount_city_id) {
            discountCityIdCondition.city_id = req.query.discount_city_id;
        }

        // const discountPickupDropCondition = {};
        // if (req.query.discount_pickup_placeId && req.query.discount_drop_placeId) {
        //     discountPickupDropCondition.pickup_city_place_id = req.query.discount_pickup_placeId;
        //     discountPickupDropCondition.drop_city_place_id = req.query.discount_drop_placeId;
        // }
        const discountPickupDropCondition = {};
				if (
					req.query.discount_pickup_placeId &&
					req.query.discount_drop_placeId
				) {
					discountPickupDropCondition[Op.or] = [
						{
							pickup_city_place_id: req.query.discount_pickup_placeId,
							drop_city_place_id: req.query.discount_drop_placeId,
						},
						{
							pickup_city_place_id: req.query.discount_drop_placeId,
							drop_city_place_id: req.query.discount_pickup_placeId,
							is_bidirectional: true,
						},
					];
				}

// console.log("discountPickupDropCondition", discountPickupDropCondition);
        // const discountPickupCondition = {};
        // if (req.query.discount_pickup_placeId) {
        //     discountPickupDropCondition.pickup_city_place_id = req.query.discount_pickup_placeId;
        // }

        const whereCondition = {
            ...(search && {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                ],
            })
        };

        const includeConditions = [
					...(Object.keys(airportWhereCondition).length > 0
						? [
								{
									model: AirportPricing,
									as: "airport_pricings",
									where: airportWhereCondition,
								},
						  ]
						: []),

					...(Object.keys(localWhereCondition).length > 0
						? [
								{
									model: LocalRentalPricing,
									as: "local_rental_pricings",
									where: localWhereCondition,
								},
						  ]
						: []),

					...(Object.keys(dhamWhereCondition).length > 0
						? [
								{
									model: DhamPricing,
									as: "dham_pricings",
									where: dhamWhereCondition,
								},
						  ]
						: []),

					{
						model: OneWayTripPricing,
						as: "one_way_trip_pricings",
					},

					...(Object.keys(discountTripTypeCondition).length > 0
						? [
								{
									model: DiscountVehicle,
									as: "discount_vehicles",
									where: {
										...discountTripTypeCondition,
									},
									required: false,
									include: [
										...(Object.keys(discountCityIdCondition).length > 0 ||
										discountPickupDropCondition
											? //  || Object.keys(discountPickupCondition).length > 0
											  [
													{
														model: DiscountCity,
														as: "discount_cities",
														where: {
															...(Object.keys(discountCityIdCondition).length >
															0
																? discountCityIdCondition
																: {}),
                                                                ...discountCityIdCondition,
															...discountPickupDropCondition,
															// ...(Object.keys(discountPickupDropCondition)
															// 	.length > 0
															// 	? discountPickupDropCondition
															// 	: {}),
															// ...(Object.keys(discountPickupCondition).length > 0 ? discountPickupCondition : {}),
														},
														// include: [
														//     {
														//         model: Discount,
														//         as: 'discounts',
														//     }
														// ],
														required: false,
													},
											  ]
											: []),
									],
								},
						  ]
						: []),
				];

        const queryOptions = {
            where: {
                ...whereCondition,
            },
            include: includeConditions,
            distinct: true,
            offset: (pageNumber - 1) * itemsPerPage,
            limit: itemsPerPage,
            order: [["createdAt", "DESC"]],
        };

        const { count, rows: Vehicles } = await Vehicle.findAndCountAll(queryOptions);
        // console.log("Vehicles", Vehicles);

        
        const filteredVehicles = await JSON.parse(JSON.stringify(Vehicles)).map((vehicle) => {
            if (vehicle.discount_vehicles && vehicle.discount_vehicles.length > 0) {
                vehicle.discount_vehicles = vehicle.discount_vehicles.filter(
                    (discountVehicle) => discountVehicle.discount_cities !== null
                );
            }
            return vehicle;
        });
        
        const totalPages = Math.ceil(count / itemsPerPage);
        const from = (pageNumber - 1) * itemsPerPage + 1;
        const to = Math.min(pageNumber * itemsPerPage, count);

        const VehiclesWithIndex = filteredVehicles.map((quotation, index) => ({
					...quotation,
					index_no: from + index,
				}));

        const links = [];

        if (pageNumber > 1) {
            links.push({
                label: "Previous",
                page: pageNumber - 1,
                url: `/?page=${pageNumber - 1}&items_per_page=${itemsPerPage}`,
            });
        }

        for (let i = 1; i <= totalPages; i++) {
            links.push({
                label: i.toString(),
                page: i,
                url: `/?page=${i}&items_per_page=${itemsPerPage}`,
            });
        }

        if (pageNumber < totalPages) {
            links.push({
                label: "Next",
                page: pageNumber + 1,
                url: `/?page=${pageNumber + 1}&items_per_page=${itemsPerPage}`,
            });
        }

        const pagination = {
            first_page_url: `/?page=1&items_per_page=${itemsPerPage}`,
            from,
            items_per_page: itemsPerPage,
            last_page: totalPages,
            items_per_pages: [10, 20, 50, 100, 150],
            next_page_url:
                pageNumber < totalPages
                    ? `/?page=${pageNumber + 1}&items_per_page=${itemsPerPage}`
                    : null,
            page: pageNumber,
            prev_page_url:
                pageNumber > 1
                    ? `/?page=${pageNumber - 1}&items_per_page=${itemsPerPage}`
                    : null,
            to,
            total: count,
            links,
        };

        res.status(200).json({
            status: true,
            data: VehiclesWithIndex,
            payload: {
                pagination: pagination,
            },
            message: "Vehicles fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching Vehicles:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Vehicle.findByPk(id);

        if (data) {
            const rentalPricing = await LocalRentalPricing.findOne({
                where: { vehicle_id: id }
            });
            if (rentalPricing) {
                res.status(200).json({
                    status: false,
                    message: `Vehicle is used somewhere!!`
                });
            } else {
                await OneWayTripPricing.destroy({ where: { vehicle_id: id } });
                const existingImagePath = path.join(__dirname, '../public/vehicle', data.image);
                if (fs.existsSync(existingImagePath)) {
                    fs.unlinkSync(existingImagePath);
                }
                await data.destroy();
                res.status(200).json({
                    status: true,
                    data: data,
                    message: 'Vehicle deleted successfully'
                });
            }

        } else {
            res.status(404).json({
                status: false,
                message: 'Vehicle Not Found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
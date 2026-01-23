const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const { Session } = require('../models');
const fs = require('fs');
const { Sequelize, Op } = require('sequelize');

const generateSessionId = () => {
    const datePart = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `SID-${datePart}-${randomPart}`;
};

exports.createSession = async (req, res) => {
    try {
        const {
                distance,
                phoneNo,
                pickUpDate,
                dropDate,
                places,
                tripType,
                category,
                city_id,
                local_rental_plan_id,
                time,
                airport_id,
                airport_city_id,
                airport_from_to,
                car_tab,
                check_in,
                check_out,
                adult,
                children,
                rooms,
                hotel_city_id,
                children_ages,
                dham_package_id,
                dham_pickup_city_id,
                dham_package_days,
                dham_category_id,
                discount_slug,
                pincode,
			} = req.body;
console.log("pincode", pincode);
        const sessionId = generateSessionId();

        const Schema = Joi.object({
            car_tab: Joi.string()
                .required()
                .messages({
                    'any.required': 'Car Tab is required.',
                    'string.base': 'Car Tab must be a valid string.',
                }),
            tripType: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('taxi'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'any.required': 'Trip Type is required.',
                    'string.base': 'Trip Type must be a valid string.',
                }),
            category: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('taxi'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'any.required': 'Category is required.',
                    'string.base': 'Category must be a valid string.',
                }),
            distance: Joi.number()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('taxi'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Distance must be a valid number',
                    'any.required': 'Distance is required',
                    'number.precision': 'Distance can only have up to 10 decimal places',
                }),
            check_in: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'string.base': 'Check In must be a valid string',
                    'any.required': 'Check In is required',
                }),
            check_out: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'string.base': 'Check Out must be a valid string',
                    'any.required': 'Check Out is required',
                }),
            adult: Joi.number()
                .integer()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Adult must be a valid number',
                    'number.integer': 'Adult must be an integer',
                    'any.required': 'Adult is required',
                }),
            children: Joi.number()
                .integer()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Children must be a valid number',
                    'number.integer': 'Children must be an integer',
                    'any.required': 'Children is required',
                }),

            rooms: Joi.number()
                .integer()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Rooms must be a valid number',
                    'number.integer': 'Rooms must be an integer',
                    'any.required': 'Rooms is required',
                }),
            phoneNo: Joi.string()
                .required()
                .min(5)
                .max(15)
                .messages({
                    'any.required': 'Phone number is required',
                    'string.min': 'Phone number must be at least 5 characters long',
                    'string.max': 'Phone number cannot be more than 15 characters long',
                }),
            pickUpDate: Joi.date()
                .iso()
                .allow('', null)
                // .required()
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
            dropDate: Joi.date()
                .iso()
                .allow('', null)
                .custom((value, helpers) => {
                    if (!value) {
                        return value;
                    }

                    const { pickUpDate } = helpers.state.ancestors[0];
                    const pickUpTime = new Date(pickUpDate);
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
            places: Joi.array()
                .items(
                    Joi.object({
                        label: Joi.string().required(),
                        value: Joi.string().required(),
                    })
                )
                .when('car_tab', {
                    is: Joi.valid('hotel', 'chardham'),
                    then: Joi.array().min(0),
                    otherwise: Joi.when('tripType', {
                        is: 'local',
                        then: Joi.array().min(1),
                        otherwise: Joi.array().min(2),
                    })
                })
                .required()
                .messages({
                    'array.min': 'Please select the places',
                    'any.required': 'Please select the places',
                }),
            city_id: Joi.alternatives().conditional('tripType', {
                is: 'local',
                then: Joi.number().required().messages({
                    'any.required': 'City is required.',
                    'number.base': 'City ID must be a valid number.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'City ID must be a valid number.',
                }),
            }),
            hotel_city_id: Joi.alternatives().conditional('car_tab', {
                is: 'hotel',
                then: Joi.number().required().messages({
                    'any.required': 'Hotel City is required.',
                    'number.base': 'Hotel City is required.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'Hotel City is required.',
                }),
            }),
            local_rental_plan_id: Joi.alternatives().conditional('tripType', {
                is: 'local',
                then: Joi.number().required().messages({
                    'any.required': 'Plan is required.',
                    'number.base': 'Plan must be a valid number.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'Plan must be a valid number.',
                }),
            }),
            airport_id: Joi.alternatives().conditional('tripType', {
                is: 'airport',
                then: Joi.number().required().messages({
                    'any.required': 'Airport is required.',
                    'number.base': 'Airport ID must be a valid number.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'Airport ID must be a valid number.',
                }),
            }),
            airport_city_id: Joi.alternatives().conditional('tripType', {
                is: 'airport',
                then: Joi.number().required().messages({
                    'any.required': 'Please select a city',
                    'number.base': 'city must be a valid number',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'city must be a valid number',
                }),
            }),
            airport_from_to: Joi.alternatives().conditional('tripType', {
                is: 'airport',
                then: Joi.string().required().messages({
                    'any.required': 'Please select from/to',
                    'string.base': 'Please select from/to',
                }),
                otherwise: Joi.string().optional().allow(null).messages({
                    'string.base': 'Please select from/to',
                }),
            }),
            dham_package_id: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Please Select Dham Package',
                    'number.base': 'Please Select Dham Package',
                    'number.integer': 'Please Select Dham Package',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Please Select Dham Package',
                    'number.integer': 'Please Select Dham Package',
                }),
            }),
            dham_pickup_city_id: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Please Select Dham City',
                    'number.base': 'Please Select Dham City',
                    'number.integer': 'Please Select Dham City',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Please Select Dham City',
                    'number.integer': 'Please Select Dham City',
                }),
            }),
            dham_package_days: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Days are not fetching',
                    'number.base': 'Days are not fetching',
                    'number.integer': 'Days are not fetching',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Days are not fetching',
                    'number.integer': 'Days are not fetching',
                }),
            }),
            dham_category_id: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Please Select Dham Category',
                    'number.base': 'Please Select Dham Category',
                    'number.integer': 'Please Select Dham Category',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Please Select Dham Category',
                    'number.integer': 'Please Select Dham Category',
                }),
            }),
        }).unknown(true);
        const { error } = Schema.validate(
            { ...req.body },
            { abortEarly: false }
        );

        if (error) {
            const customMessages = error.details.map((err) => {
                return err.message.replace(/['"]+/g, "");
            });

            return res.json({
                status: false,
                message: customMessages[0],
            });
        }

        const session = await Session.create({
					session_id: sessionId,
					places,
					distance,
					phoneNo,
					pickUpDate,
					dropDate,
					tripType,
					category,
					city_id,
					hotel_city_id,
					local_rental_plan_id,
					time,
					airport_id,
					airport_city_id,
					airport_from_to,
					car_tab,
					check_in,
					check_out,
					adult,
					children,
					rooms,
					children_ages,
					dham_package_id,
					dham_pickup_city_id,
					dham_package_days,
					dham_category_id,
					discount_slug,
					pincode,
				});

        res.status(200).json({
            status: true,
            data: session,
            message: 'Session Created Successfully',
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Session.findOne({ where: { session_id: id } });

        if (data) {
            let placesArray = [];
            if (data.places) {
                try {
                    placesArray = JSON.parse(data.places);
                } catch (parseError) {
                    return res.status(400).json({
                        status: false,
                        message: 'Invalid JSON format in places',
                    });
                }
            }

            let childrenAges = [];
            if (data.children_ages) {
                try {
                    childrenAges = JSON.parse(data.children_ages);
                } catch (parseError) {
                    return res.status(400).json({
                        status: false,
                        message: 'Invalid JSON format in children_ages',
                    });
                }
            }

            res.status(200).json({
                status: true,
                data: { ...data.toJSON(), places: placesArray, children_ages: childrenAges },
                message: 'Data Details Fetched',
            });
        } else {
            res.json({
                status: false,
                message: 'Data Not Found',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.updateSession = async (req, res) => {

    try {
        const { id } = req.params;
        const {
            distance,
            phoneNo,
            pickUpDate,
            dropDate,
            places,
            tripType,
            category,
            city_id,
            local_rental_plan_id,
            time,
            airport_id,
            airport_city_id,
            airport_from_to,
            car_tab,
            check_in,
            check_out,
            adult,
            children,
            rooms,
            hotel_city_id,
            children_ages,
            dham_package_id,
            dham_pickup_city_id,
            dham_package_days,
            dham_category_id,
            discount_slug,
            pincode
        } = req.body;

        const Schema = Joi.object({
            car_tab: Joi.string()
                .required()
                .messages({
                    'any.required': 'Car Tab is required.',
                    'string.base': 'Car Tab must be a valid string.',
                }),
            tripType: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('taxi'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'any.required': 'Trip Type is required.',
                    'string.base': 'Trip Type must be a valid string.',
                }),
            category: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('taxi'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'any.required': 'Category is required.',
                    'string.base': 'Category must be a valid string.',
                }),
            distance: Joi.number()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('taxi'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Distance must be a valid number',
                    'any.required': 'Distance is required',
                    'number.precision': 'Distance can only have up to 10 decimal places',
                }),
            check_in: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'string.base': 'Check In must be a valid string',
                    'any.required': 'Check In is required',
                }),
            check_out: Joi.string()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'string.base': 'Check Out must be a valid string',
                    'any.required': 'Check Out is required',
                }),
            adult: Joi.number()
                .integer()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Adult must be a valid number',
                    'number.integer': 'Adult must be an integer',
                    'any.required': 'Adult is required',
                }),
            children: Joi.number()
                .integer()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Children must be a valid number',
                    'number.integer': 'Children must be an integer',
                    'any.required': 'Children is required',
                }),

            rooms: Joi.number()
                .integer()
                .allow(null)
                .when('car_tab', {
                    is: Joi.valid('hotel'),
                    then: Joi.optional(),
                    otherwise: Joi.required(),
                })
                .messages({
                    'number.base': 'Rooms must be a valid number',
                    'number.integer': 'Rooms must be an integer',
                    'any.required': 'Rooms is required',
                }),
            phoneNo: Joi.string()
                .required()
                .min(5)
                .max(15)
                .messages({
                    'any.required': 'Phone number is required',
                    'string.min': 'Phone number must be at least 5 characters long',
                    'string.max': 'Phone number cannot be more than 15 characters long',
                }),
            pickUpDate: Joi.date()
                .iso()
                .allow('', null)
                // .required()
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
            dropDate: Joi.date()
                .iso()
                .allow('', null)
                .custom((value, helpers) => {
                    if (!value) {
                        return value;
                    }

                    const { pickUpDate } = helpers.state.ancestors[0];
                    const pickUpTime = new Date(pickUpDate);
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
            places: Joi.array()
                .items(
                    Joi.object({
                        label: Joi.string().required(),
                        value: Joi.string().required(),
                    })
                )
                .when('car_tab', {
                    is: Joi.valid('hotel', 'chardham'),
                    then: Joi.array().min(0),
                    otherwise: Joi.when('tripType', {
                        is: 'local',
                        then: Joi.array().min(1),
                        otherwise: Joi.array().min(2),
                    })
                })
                .required()
                .messages({
                    'array.min': 'Please select the places',
                    'any.required': 'Please select the places',
                }),
            city_id: Joi.alternatives().conditional('tripType', {
                is: 'local',
                then: Joi.number().required().messages({
                    'any.required': 'City is required.',
                    'number.base': 'City ID must be a valid number.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'City ID must be a valid number.',
                }),
            }),
            hotel_city_id: Joi.alternatives().conditional('car_tab', {
                is: 'hotel',
                then: Joi.number().required().messages({
                    'any.required': 'Hotel City is required.',
                    'number.base': 'Hotel City is required.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'Hotel City is required.',
                }),
            }),
            local_rental_plan_id: Joi.alternatives().conditional('tripType', {
                is: 'local',
                then: Joi.number().required().messages({
                    'any.required': 'Plan is required.',
                    'number.base': 'Plan must be a valid number.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'Plan must be a valid number.',
                }),
            }),
            airport_id: Joi.alternatives().conditional('tripType', {
                is: 'airport',
                then: Joi.number().required().messages({
                    'any.required': 'Airport is required.',
                    'number.base': 'Airport ID must be a valid number.',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'Airport ID must be a valid number.',
                }),
            }),
            airport_city_id: Joi.alternatives().conditional('tripType', {
                is: 'airport',
                then: Joi.number().required().messages({
                    'any.required': 'Please select a city',
                    'number.base': 'city must be a valid number',
                }),
                otherwise: Joi.number().optional().allow(null).messages({
                    'number.base': 'city must be a valid number',
                }),
            }),
            airport_from_to: Joi.alternatives().conditional('tripType', {
                is: 'airport',
                then: Joi.string().required().messages({
                    'any.required': 'Please select from/to',
                    'string.base': 'Please select from/to',
                }),
                otherwise: Joi.string().optional().allow(null).messages({
                    'string.base': 'Please select from/to',
                }),
            }),
            dham_package_id: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Please Select Dham Package',
                    'number.base': 'Please Select Dham Package',
                    'number.integer': 'Please Select Dham Package',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Please Select Dham Package',
                    'number.integer': 'Please Select Dham Package',
                }),
            }),
            dham_pickup_city_id: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Please Select Dham City',
                    'number.base': 'Please Select Dham City',
                    'number.integer': 'Please Select Dham City',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Please Select Dham City',
                    'number.integer': 'Please Select Dham City',
                }),
            }),
            dham_package_days: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Days are not fetching',
                    'number.base': 'Days are not fetching',
                    'number.integer': 'Days are not fetching',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Days are not fetching',
                    'number.integer': 'Days are not fetching',
                }),
            }),
            dham_category_id: Joi.alternatives().conditional('car_tab', {
                is: 'chardham',
                then: Joi.number().integer().required().messages({
                    'any.required': 'Please Select Dham Category',
                    'number.base': 'Please Select Dham Category',
                    'number.integer': 'Please Select Dham Category',
                }),
                otherwise: Joi.number().integer().optional().allow(null).messages({
                    'number.base': 'Please Select Dham Category',
                    'number.integer': 'Please Select Dham Category',
                }),
            }),
        }).unknown(true);

        const { error } = Schema.validate(
            { ...req.body },
            { abortEarly: false }
        );
        if (error) {
            return res.json({
                status: false,
                message: error.details[0].message,
            });
        }
        const data = await Session.findOne({ where: { session_id: id } });
        if (!data) {
            return res.json({
                status: false,
                message: 'Data not found',
            });
        }

        data.distance = distance;
        data.phoneNo = phoneNo;
        data.pickUpDate = pickUpDate;
        data.dropDate = dropDate;
        data.places = places;
        data.tripType = tripType;
        data.category = category;
        data.local_rental_plan_id = local_rental_plan_id;
        data.city_id = city_id;
        data.time = time;
        data.airport_id = airport_id;
        data.airport_city_id = airport_city_id;
        data.airport_from_to = airport_from_to;
        data.car_tab = car_tab;
        data.check_in = check_in;
        data.check_out = check_out;
        data.adult = adult;
        data.children = children;
        data.rooms = rooms;
        data.hotel_city_id = hotel_city_id;
        data.children_ages = children_ages;
        data.dham_package_id = dham_package_id;
        data.dham_pickup_city_id = dham_pickup_city_id;
        data.dham_package_days = dham_package_days;
        data.dham_category_id = dham_category_id;
        data.discount_slug = discount_slug;
        data.pincode = pincode;

        await data.save();

        res.status(200).json({
            status: true,
            data: data,
            message: 'Data Updated Successfully',
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const data = await Session.findAll();

        res.status(200).json({
            status: true,
            data: data,
            message: 'Listing fetch successfully.'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};


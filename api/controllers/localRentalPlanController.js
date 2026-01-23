const Joi = require('joi');
const { localrentalplans, LocalRentalPricing, Vehicle } = require('../models');
const fs = require('fs');
const { Sequelize, Op } = require('sequelize');

exports.create = async (req, res) => {
    try {
        const {
            hours,
            km,
            local_rental_pricings,
        } = req.body;

        const validationSchema = Joi.object({
            hours: Joi.string().required().messages({
                'string.empty': 'Hours is required',
                'any.required': 'Hours is required',
            }),
            km: Joi.string().required().messages({
                'string.empty': 'Kilometers is required',
                'any.required': 'Kilometers is required',
            }),
            local_rental_pricings: Joi.array()
                .items(
                    Joi.object({
                        local_rental_plan_id: Joi.number().integer().optional(),
                        vehicle_id: Joi.number().required(),
                        city_id: Joi.number().required(),
                        price: Joi.string().required(),
                        id: Joi.number().integer().optional(),
                        createdBy: Joi.string().allow(null).optional(),
                        updatedBy: Joi.string().allow(null).optional(),
                        createdAt: Joi.string().optional(),
                        updatedAt: Joi.string().optional(),
                        vehicles: Joi.any().optional()
                    })
                )
                .optional(),
        }).unknown(true);

        const { error } = validationSchema.validate(
            { ...req.body },
            { abortEarly: false }
        );
        if (error) {
            return res.json({
                status: false,
                message: error.details.map((err) => err.message).join(', '),
            });
        }

        const existingPlan = await localrentalplans.findOne({
            where: {
                hours: hours,
                km: km
            }
        });

        if (existingPlan) {
            return res.json({
                status: false,
                message: 'This plan has already been added.',
            });
        }

        const localrentalplan = await localrentalplans.create({
            hours,
            km
        });

        if (local_rental_pricings) {
            const tripPricings = local_rental_pricings.map((pricing) => ({
                ...pricing,
                local_rental_plan_id: localrentalplan.id,
            }));

            await LocalRentalPricing.bulkCreate(tripPricings);
        }

        res.status(200).json({
            status: true,
            data: localrentalplan,
            message: 'Localrentalplan Created Successfully',
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            hours,
            km,
            local_rental_pricings,
        } = req.body;

        const validationSchema = Joi.object({
            hours: Joi.string().required().messages({
                'string.empty': 'Hours is required',
                'any.required': 'Hours is required',
            }),
            km: Joi.string().required().messages({
                'string.empty': 'Kilometers is required',
                'any.required': 'Kilometers is required',
            }),
            local_rental_pricings: Joi.array()
                .items(
                    Joi.object({
                        local_rental_plan_id: Joi.number().integer().optional(),
                        vehicle_id: Joi.number().required(),
                        city_id: Joi.number().required(),
                        price: Joi.string().required(),
                        id: Joi.number().integer().optional(),
                        createdBy: Joi.string().allow(null).optional(),
                        updatedBy: Joi.string().allow(null).optional(),
                        createdAt: Joi.string().optional(),
                        updatedAt: Joi.string().optional(),
                        vehicles: Joi.any().optional()
                    })
                )
                .optional(),
        }).unknown(true);

        const { error } = validationSchema.validate(
            { ...req.body },
            { abortEarly: false }
        );
        if (error) {
            return res.json({
                status: false,
                message: error.details.map((err) => err.message).join(', '),
            });
        }

        const existingPlan = await localrentalplans.findOne({
            where: {
                hours: hours,
                km: km,
                id: { [Op.ne]: id }
            }
        });

        if (existingPlan) {
            return res.json({
                status: false,
                message: 'This plan has already been added.',
            });
        }


        const localrentalplan = await localrentalplans.findByPk(id);
        if (!localrentalplan) {
            return res.json({
                status: false,
                message: 'Localrentalplan not found',
            });
        }

        localrentalplan.hours = hours;
        localrentalplan.km = km;
        await localrentalplan.save();

        if (local_rental_pricings) {
            await LocalRentalPricing.destroy({ where: { local_rental_plan_id: id } });

            const bulkData = local_rental_pricings.map((pricing) => ({
                ...pricing,
                local_rental_plan_id: localrentalplan.id,
            }));

            await LocalRentalPricing.bulkCreate(bulkData);
        }

        res.status(200).json({
            status: true,
            data: localrentalplan,
            message: 'Localrentalplan Updated Successfully',
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
        const { city_id } = req.query;

        const whereCondition = city_id ? { city_id } : {};
        const data = await localrentalplans.findByPk(id, {
            include: [
                {
                    model: LocalRentalPricing,
                    as: 'local_rental_pricings',
                    where: whereCondition,
                    include: [
                        {
                            model: Vehicle,
                            as: 'vehicles',
                        }
                    ]
                }
            ]
        });

        if (data) {
            res.status(200).json({
                status: true,
                data: data,
                message: 'Localrentalplan Details Fetched'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Localrentalplan Not Found'
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
        const data = await localrentalplans.findAll();
        // const data = await localrentalplans.findAll({
        //     include: {
        //         model: LocalRentalPricing,
        //         as: 'local_rental_pricings',
        //         where: { city_id: 3 },
        //         include: {
        //             model: Vehicle,
        //             as: 'vehicles',
        //         }
        //     },
        // });
        res.status(200).json({
            status: true,
            data: data,
            message: 'Localrentalplan fetch successfully.'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await localrentalplans.findByPk(id);

        if (data) {
            await data.destroy();
            res.status(200).json({
                status: true,
                data: data,
                message: 'Localrentalplan deleted successfully'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Localrentalplan Not Found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
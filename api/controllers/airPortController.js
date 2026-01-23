const Joi = require('joi');
const { airports, cities, AirportPricing } = require('../models');
const fs = require('fs');
const { Sequelize, Op } = require('sequelize');


exports.create = async (req, res) => {
    try {
        const {
            name,
            airport_pricings
        } = req.body;

        const validationSchema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'Name is required',
                'any.required': 'Name is required',
            }),
            airport_pricings: Joi.array()
                .items(
                    Joi.object({
                        airport_id: Joi.number().integer().optional(),
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

        const airport = await airports.create({
            name
        });

        if (airport_pricings) {
            const tripPricings = airport_pricings.map((pricing) => ({
                ...pricing,
                airport_id: airport.id,
            }));

            await AirportPricing.bulkCreate(tripPricings);
        }

        res.status(200).json({
            status: true,
            data: airport,
            message: 'Airport Created Successfully',
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
            name,
            airport_pricings
        } = req.body;

        const validationSchema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'Name is required',
                'any.required': 'Name is required',
            }),
            airport_pricings: Joi.array()
                .items(
                    Joi.object({
                        airport_id: Joi.number().integer().optional(),
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

        const airport = await airports.findByPk(id);
        if (!airport) {
            return res.json({
                status: false,
                message: 'Airport not found',
            });
        }

        airport.name = name;
        await airport.save();

        const existingPricings = await AirportPricing.findAll({ where: { airport_id: id } });

        if (airport_pricings) {
            // await AirportPricing.destroy({ where: { airport_id: id } });

            // const bulkData = airport_pricings.map((pricing) => ({
            //     ...pricing,
            //     airport_id: airport.id,
            // }));

            // await AirportPricing.bulkCreate(bulkData);

            const existingMap = new Map();
            existingPricings.forEach((pricing) => {
                existingMap.set(pricing.id, pricing);
            });

            // Prepare arrays for insert, update, and delete operations
            const newPricings = [];
            const updatedPricings = [];
            const frontendIds = new Set();

            // Process incoming pricing data
            for (const pricing of airport_pricings) {
                frontendIds.add(pricing.id);

                if (!pricing.id || !existingMap.has(pricing.id)) {
                    // New pricing (Insert)
                    newPricings.push({ ...pricing, airport_id: airport.id });
                } else {
                    // Existing pricing (Update)
                    updatedPricings.push(pricing);
                }
            }

            // Identify records to delete (existing records not in the frontend data)
            const idsToDelete = existingPricings
                .filter((pricing) => !frontendIds.has(pricing.id))
                .map((pricing) => pricing.id);

            // Perform bulk operations
            if (newPricings.length) {
                await AirportPricing.bulkCreate(newPricings);
            }

            if (updatedPricings.length) {
                const updatePromises = updatedPricings.map((pricing) => ({
                    id: pricing.id,
                    data: pricing,
                }));

                // Execute batch updates
                for (const { id, data } of updatePromises) {
                    await AirportPricing.update(data, { where: { id } });
                }
            }

            if (idsToDelete.length) {
                await AirportPricing.destroy({ where: { id: idsToDelete } });
            }
        }

        res.status(200).json({
            status: true,
            data: airport,
            message: 'Airport Updated Successfully',
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

        const data = await airports.findByPk(id, {
            include: [
                {
                    model: AirportPricing,
                    as: 'airport_pricings',
                }
            ]
        });

        if (data) {
            res.status(200).json({
                status: true,
                data: data,
                message: 'Airport Details Fetched'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Airport Not Found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// exports.getAll = async (req, res) => {
//     try {
//         const data = await airports.findAll();
//         res.status(200).json({
//             status: true,
//             data: data,
//             message: 'Airport fetch successfully.'
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: error.message
//         });
//     }
// };

exports.getAll = async (req, res) => {
	try {
		const {
			page = 1,
			items_per_page = 10,
			search = "",
		} = req.query;

		const pageNumber = parseInt(page, 10);
		const itemsPerPage = parseInt(items_per_page, 10);

		const whereCondition = {
			...(search && {
				[Op.or]: [
					{ name: { [Op.like]: `%${search}%` } },
				],
			}),
		};
		
		const { count, rows: Airports } = await airports.findAndCountAll({
			where: whereCondition,
			offset: (pageNumber - 1) * itemsPerPage,
			limit: itemsPerPage,
			order: [["createdAt", "DESC"]],
		});

		const totalPages = Math.ceil(count / itemsPerPage);
		const from = (pageNumber - 1) * itemsPerPage + 1;
		const to = Math.min(pageNumber * itemsPerPage, count);

		const AirportsWithIndex = Airports.map((quotation, index) => ({
			...quotation.toJSON(),
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
			data: AirportsWithIndex,
			payload: {
				pagination: pagination,
			},
			message: "Airports fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching Airports:", error);
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await airports.findByPk(id);

        if (data) {
            const city = await cities.findOne({
                where: { airport_id: id }
            });
            if (city) {
                res.status(200).json({
                    status: false,
                    message: `Airport is used somewhere!!`
                });
            } else {
                await data.destroy();
                res.status(200).json({
                    status: true,
                    data: data,
                    message: 'Airport deleted successfully'
                });
            }
        } else {
            res.status(404).json({
                status: false,
                message: 'Airport Not Found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
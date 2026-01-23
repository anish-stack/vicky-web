const Joi = require('joi');
const { dhamPackages, DhamPackageRoute, DhamPickupCity, DhamStop, DhamPricing, DhamCategory } = require('../models');
const path = require('path');

const fs = require('fs');
const { Sequelize, Op } = require('sequelize');

exports.create = async (req, res) => {
    try {
        let {
            name,
            dham_category_id,
            distance,
            dham_pickup_cities
        } = req.body;

        const validationSchema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'Name is required',
                'any.required': 'Name is required',
            })
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

        const folderPath = path.join(__dirname, '../public/dham');

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: 'Image is required',
            });
        }

        const data = await dhamPackages.create({
            image: req.file.filename,
            name,
            dham_category_id,
            distance
        });

        if (dham_pickup_cities) {
            dham_pickup_cities = JSON.parse(dham_pickup_cities);

            if (Array.isArray(dham_pickup_cities) && dham_pickup_cities.length > 0) {
                let cityRecords = [];
                let stopRecords = [];
                let pricingRecords = [];

                dham_pickup_cities.forEach((data_cities) => {
                    cityRecords.push({
                        name: data_cities.name,
                        days: data_cities.days,
                        dham_package_id: data.id,
                    });
                });

                const insertedCities = await DhamPickupCity.bulkCreate(cityRecords, { returning: true });

                insertedCities.forEach((city, index) => {
                    const stops = dham_pickup_cities[index].dham_stops || [];
                    stops.forEach((stop) => {
                        stopRecords.push({
                            name: stop.name,
                            description: stop.description,
                            dham_pickup_city_id: city.id,
                        });
                    });
                });

                if (stopRecords.length > 0) {
                    await DhamStop.bulkCreate(stopRecords);
                }


                insertedCities.forEach((city, index) => {
                    const pricings = dham_pickup_cities[index].dham_pricings || [];
                    pricings.forEach((obj) => {
                        pricingRecords.push({
                            vehicle_id: obj.vehicle_id,
                            price: obj.price,
                            discount: obj.discount,
                            dham_pickup_city_id: city.id,
                        });
                    });
                });

                if (pricingRecords.length > 0) {
                    await DhamPricing.bulkCreate(pricingRecords);
                }
            }
        }


        res.status(200).json({
            status: true,
            data: data,
            message: 'Dham Package Created Successfully',
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
        let {
            name,
            dham_category_id,
            distance,
            dham_pickup_cities
        } = req.body;

        const validationSchema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'Name is required',
                'any.required': 'Name is required',
            })
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

        const data = await dhamPackages.findByPk(id);
        if (!data) {
            return res.json({
                status: false,
                message: 'Data not found',
            });
        }

        if (req.file) {
            if (data.image) {
                const existingImagePath = path.join(__dirname, '../public/dham', data.image);
                if (fs.existsSync(existingImagePath)) {
                    fs.unlinkSync(existingImagePath);
                }
            }
            data.image = req.file.filename;
        }

        data.name = name;
        data.dham_category_id = dham_category_id;
        data.distance = distance;

        await data.save();

        const existing = await DhamPickupCity.findAll({ where: { dham_package_id: id } });
        dham_pickup_cities = JSON.parse(dham_pickup_cities);

        if (Array.isArray(dham_pickup_cities) && dham_pickup_cities.length > 0) {
            const existingMap = new Map();
            existing.forEach((data) => {
                existingMap.set(data.id, data);
            });

            const newData = [];
            const updatedData = [];
            const frontendIds = new Set();

            for (const dhampackage of dham_pickup_cities) {
                frontendIds.add(dhampackage.id);

                if (!dhampackage.id || !existingMap.has(dhampackage.id)) {
                    newData.push({ name: dhampackage.name, days: dhampackage.days, dham_package_id: id });
                } else {
                    updatedData.push(dhampackage);
                }
            }

            const idsToDelete = existing
                .filter((data) => !frontendIds.has(data.id))
                .map((data) => data.id);

            let createdCities = [];
            if (newData.length) {
                createdCities = await DhamPickupCity.bulkCreate(newData, { returning: true });
            }

            if (createdCities.length) {
                const newStops = [];
                const newPricings = [];
                for (const city of createdCities) {
                    const originalCityData = dham_pickup_cities.find(c => c.name === city.name);

                    if (originalCityData?.dham_stops && Array.isArray(originalCityData.dham_stops)) {
                        for (const stop of originalCityData.dham_stops) {
                            newStops.push({
                                name: stop.name,
                                description: stop.description,
                                dham_pickup_city_id: city.id
                            });
                        }
                    }

                    if (originalCityData?.dham_pricings && Array.isArray(originalCityData.dham_pricings)) {
                        for (const pricing of originalCityData.dham_pricings) {
                            newPricings.push({
                                vehicle_id: pricing.vehicle_id,
                                price: pricing.price,
                                discount: pricing.discount,
                                dham_pickup_city_id: city.id
                            });
                        }
                    }
                }

                if (newStops.length) {
                    await DhamStop.bulkCreate(newStops);
                }
                if (newPricings.length) {
                    await DhamPricing.bulkCreate(newPricings);
                }
            }

            if (updatedData.length) {
                for (const city of updatedData) {
                    await DhamPickupCity.update(
                        { name: city.name, days: city.days },
                        { where: { id: city.id } }
                    );

                    if (Array.isArray(city.dham_stops)) {
                        const existingStops = await DhamStop.findAll({
                            where: { dham_pickup_city_id: city.id }
                        });

                        const existingStopMap = new Map(existingStops.map(stop => [stop.id, stop]));
                        const frontendStopIds = new Set(city.dham_stops.map(stop => stop.id));

                        const newStops = [];
                        const updatedStops = [];
                        const stopIdsToDelete = [];

                        for (const stop of city.dham_stops) {
                            if (!stop.id || !existingStopMap.has(stop.id)) {
                                newStops.push({ ...stop, dham_pickup_city_id: city.id });
                            } else {
                                updatedStops.push(stop);
                            }
                        }

                        stopIdsToDelete.push(
                            ...existingStops
                                .filter(stop => !frontendStopIds.has(stop.id))
                                .map(stop => stop.id)
                        );

                        if (newStops.length) {
                            await DhamStop.bulkCreate(newStops);
                        }

                        for (const stop of updatedStops) {
                            await DhamStop.update(
                                { 
                                    name: stop.name, 
                                    description: stop.description 
                                },
                                { 
                                    where: { id: stop.id } 
                                }
                            );
                        }

                        if (stopIdsToDelete.length) {
                            await DhamStop.destroy({ where: { id: stopIdsToDelete } });
                        }
                    }

                    // Handle dham_pricings
                    if (Array.isArray(city.dham_pricings)) {
                        const existingPricings = await DhamPricing.findAll({
                            where: { dham_pickup_city_id: city.id }
                        });

                        const existingPricingMap = new Map(existingPricings.map(p => [p.id, p]));
                        const frontendPricingIds = new Set(city.dham_pricings.map(p => p.id));

                        const newPricings = [];
                        const updatedPricings = [];
                        const pricingIdsToDelete = [];

                        for (const pricing of city.dham_pricings) {
                            if (!pricing.id || !existingPricingMap.has(pricing.id)) {
                                newPricings.push({ ...pricing, dham_pickup_city_id: city.id });
                            } else {
                                updatedPricings.push(pricing);
                            }
                        }

                        pricingIdsToDelete.push(
                            ...existingPricings
                                .filter(p => !frontendPricingIds.has(p.id))
                                .map(p => p.id)
                        );

                        if (newPricings.length) {
                            await DhamPricing.bulkCreate(newPricings);
                        }

                        for (const pricing of updatedPricings) {
                            await DhamPricing.update(
                                { vehicle_id: pricing.vehicle_id, price: pricing.price, discount: pricing.discount },
                                { where: { id: pricing.id } }
                            );
                        }

                        if (pricingIdsToDelete.length) {
                            await DhamPricing.destroy({ where: { id: pricingIdsToDelete } });
                        }
                    }
                }
            }

            // Remove cities that are no longer needed
            if (idsToDelete.length) {
                await DhamPickupCity.destroy({ where: { id: idsToDelete } });
            }
        }


        res.status(200).json({
            status: true,
            data: data,
            message: 'Dham Package Updated Successfully',
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
        // const data = await dhamPackages.findByPk(id);


        const dhamPickupCity = {};
        if (req.query.dham_pickup_city_id) {
            dhamPickupCity.id = req.query.dham_pickup_city_id;
        }

        const data = await dhamPackages.findByPk(id, {
            include: [
                {
                    model: DhamPackageRoute,
                    as: 'dham_package_routes',
                },
                {
                    model: DhamPickupCity,
                    as: 'dham_pickup_cities',
                    include: [
                        {
                            model: DhamStop,
                            as: 'dham_stops',
                        },
                        {
                            model: DhamPricing,
                            as: 'dham_pricings',
                        },
                    ],
                    // where: { id: 6 }
                    ...(Object.keys(dhamPickupCity).length > 0 && { where: dhamPickupCity }),
                }
            ]
        });
        if (data) {
            res.status(200).json({
                status: true,
                data: data,
                message: 'Dham Package Details Fetched'
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'Dham Package Not Found'
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
//         const {
//             page = 1,
//             items_per_page,
//             search = ""
//         } = req.query;

//         const totalCount = await dhamPackages.count();

//         const pageNumber = parseInt(page, 10);
//         const itemsPerPage = items_per_page ? parseInt(items_per_page, 10) : totalCount;

//         const whereCondition = {
//             ...(search && {
//                 [Op.or]: [
//                     { name: { [Op.like]: `%${search}%` } },
//                 ],
//             }),
//         };

//         const { count, rows: DhamPackages } = await dhamPackages.findAndCountAll({
//             where: whereCondition,
//             include: [
//                 {
//                     model: DhamCategory,
//                     as: 'dham_categories',
//                     attributes: ['id', 'name']
//                 }
//             ],
//             offset: (pageNumber - 1) * itemsPerPage,
//             limit: itemsPerPage,
//             order: [["name", "ASC"]],
//         });

//         const totalPages = Math.ceil(count / itemsPerPage);
//         const from = (pageNumber - 1) * itemsPerPage + 1;
//         const to = Math.min(pageNumber * itemsPerPage, count);

//         const DhamPackagesWithIndex = DhamPackages.map((quotation, index) => ({
//             ...quotation.toJSON(),
//             index_no: from + index,
//         }));

//         const links = [];

//         if (pageNumber > 1) {
//             links.push({
//                 label: "Previous",
//                 page: pageNumber - 1,
//                 url: `/?page=${pageNumber - 1}&items_per_page=${itemsPerPage}`,
//             });
//         }

//         for (let i = 1; i <= totalPages; i++) {
//             links.push({
//                 label: i.toString(),
//                 page: i,
//                 url: `/?page=${i}&items_per_page=${itemsPerPage}`,
//             });
//         }

//         if (pageNumber < totalPages) {
//             links.push({
//                 label: "Next",
//                 page: pageNumber + 1,
//                 url: `/?page=${pageNumber + 1}&items_per_page=${itemsPerPage}`,
//             });
//         }

//         const pagination = {
//             first_page_url: `/?page=1&items_per_page=${itemsPerPage}`,
//             from,
//             items_per_page: itemsPerPage,
//             last_page: totalPages,
//             items_per_pages: [10, 20, 50, 100, 150],
//             next_page_url:
//                 pageNumber < totalPages
//                     ? `/?page=${pageNumber + 1}&items_per_page=${itemsPerPage}`
//                     : null,
//             page: pageNumber,
//             prev_page_url:
//                 pageNumber > 1
//                     ? `/?page=${pageNumber - 1}&items_per_page=${itemsPerPage}`
//                     : null,
//             to,
//             total: count,
//             links,
//         };

//         res.status(200).json({
//             status: true,
//             data: DhamPackagesWithIndex,
//             payload: {
//                 pagination: pagination,
//             },
//             message: "DhamPackages fetched successfully",
//         });
//     } catch (error) {
//         console.error("Error fetching DhamPackages:", error);
//         res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

exports.getAll = async (req, res) => {
    try {
        const {
            page = 1,
            items_per_page,
            search = "",
            dham_category_id
        } = req.query;

        const totalCount = await dhamPackages.count();

        const pageNumber = parseInt(page, 10);
        const itemsPerPage = items_per_page ? parseInt(items_per_page, 10) : totalCount;

        const whereCondition = {
            ...(search && {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                ],
            }),
            ...(dham_category_id && {
                dham_category_id: dham_category_id,
            }),
        };

        const { count, rows: DhamPackages } = await dhamPackages.findAndCountAll({
            where: whereCondition,
            attributes: [
                'id',
                'name',
                'image',
                'dham_category_id',
                'distance',
                'createdAt',
                'updatedAt',
                [Sequelize.col('dham_categories.name'), 'dham_category_name']
            ],
            include: [
                {
                    model: DhamCategory,
                    as: 'dham_categories',
                    attributes: []
                }
            ],
            offset: (pageNumber - 1) * itemsPerPage,
            limit: itemsPerPage,
            order: [["name", "ASC"]],
            raw: true
        });

        const totalPages = Math.ceil(count / itemsPerPage);
        const from = (pageNumber - 1) * itemsPerPage + 1;
        const to = Math.min(pageNumber * itemsPerPage, count);

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
            data: DhamPackages,
            payload: {
                pagination: pagination,
            },
            message: "DhamPackages fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching DhamPackages:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await dhamPackages.findByPk(id);

        if (data) {
            const existingImagePath = path.join(__dirname, '../public/dham', data.image);
            if (fs.existsSync(existingImagePath)) {
                fs.unlinkSync(existingImagePath);
            }
            await data.destroy();
            res.status(200).json({
                status: true,
                data: data,
                message: 'Dham Package deleted successfully'
            });

        } else {
            res.status(404).json({
                status: false,
                message: 'Dham Package Not Found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
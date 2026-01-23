const Joi = require('joi');
const { DhamCategory, dhamPackages } = require('../models');

const fs = require('fs');
const { Sequelize, Op } = require('sequelize');

exports.create = async (req, res) => {
    try {
        const {
            name,
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

        const data = await DhamCategory.create({
            name
        });

        res.status(200).json({
            status: true,
            data: data,
            message: 'Dham Category Created Successfully',
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
            name
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

        const data = await DhamCategory.findByPk(id);
        if (!data) {
            return res.json({
                status: false,
                message: 'Data not found',
            });
        }

        data.name = name;
        await data.save();

        res.status(200).json({
            status: true,
            data: data,
            message: 'Dham Category Updated Successfully',
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
        const data = await DhamCategory.findByPk(id);
        if (data) {
            res.status(200).json({
                status: true,
                data: data,
                message: 'Dham Category Details Fetched'
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

exports.getAll = async (req, res) => {
    try {
        const {
            page = 1,
            items_per_page,
            search = ""
        } = req.query;

        const totalCount = await DhamCategory.count();

        const pageNumber = parseInt(page, 10);
        const itemsPerPage = items_per_page ? parseInt(items_per_page, 10) : totalCount;

        const whereCondition = {
            ...(search && {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                ],
            }),
        };

        const { count, rows: DhamCategories } = await DhamCategory.findAndCountAll({
            where: whereCondition,
            offset: (pageNumber - 1) * itemsPerPage,
            limit: itemsPerPage,
            order: [["name", "ASC"]],
        });

        const totalPages = Math.ceil(count / itemsPerPage);
        const from = (pageNumber - 1) * itemsPerPage + 1;
        const to = Math.min(pageNumber * itemsPerPage, count);

        const DhamCategoriesWithIndex = DhamCategories.map((quotation, index) => ({
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
            data: DhamCategoriesWithIndex,
            payload: {
                pagination: pagination,
            },
            message: "DhamCategories fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching DhamCategories:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await DhamCategory.findByPk(id);

        if (data) {
            const DhamPackage = await dhamPackages.findOne({
                where: { dham_category_id: id }
            });

            if (DhamPackage) {
                res.status(200).json({
                    status: false,
                    message: `Dham Category is used somewhere!!`
                });
            } else {
                await data.destroy();
                res.status(200).json({
                    status: true,
                    data: data,
                    message: 'Dham Package deleted successfully'
                });
            }


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
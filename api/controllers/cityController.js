const Joi = require("joi");
const {
	cities,
	LocalRentalPricing,
	AirportPricing,
	Pincode,
	BookingLimit,
} = require("../models");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const { Op } = require("sequelize");

exports.create = async (req, res) => {
	try {
		const { name, airport_id, distance, hotel } = req.body;

		const validationSchema = Joi.object({
			name: Joi.string().required().messages({
				"string.empty": "Name is required",
				"any.required": "Name is required",
			}),
			airport_id: Joi.number().integer().required().messages({
				"number.base": "Please Select a valid Airport",
				"any.required": "Please Select Airport",
			}),
			distance: Joi.number().required().messages({
				"number.base": "Distance is required",
				"any.required": "Distance is required",
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

		const city = await cities.create({
			name,
			airport_id,
			distance,
			hotel,
		});

		res.status(200).json({
			status: true,
			data: city,
			message: "City Created Successfully",
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
			airport_id,
			distance,
			hotel,
			Pincodes = [],
			booking_limits,
		} = req.body;

		const validationSchema = Joi.object({
			name: Joi.string().required().messages({
				"string.empty": "Name is required",
				"any.required": "Name is required",
			}),
			airport_id: Joi.number().optional().integer().messages({
				"number.base": "Please Select a valid Airport",
				"any.required": "Please Select Airport",
			}),
			distance: Joi.number().required().messages({
				"number.base": "Distance is required",
				"any.required": "Distance is required",
			}),
			Pincodes: Joi.array().items(
				Joi.object({
					id: Joi.number().optional(),
					area_name: Joi.string().max(100).required(),
					// pincode: Joi.string().length(6).pattern(/^\d+$/).required(),

					pincode: Joi.alternatives()
						.try(
							Joi.string().length(6).pattern(/^\d+$/),
							Joi.number().integer().min(100000).max(999999)
						)
						.required()
						.messages({
							"any.required": "Pincode is required",
							"string.pattern.base": "Pincode must be 6 digits",
							"number.base": "Pincode must be a number",
							"number.min": "Pincode must be at least 6 digits",
							"number.max": "Pincode must be at most 6 digits",
						}),
				}).unknown(true)
			),
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

		const city = await cities.findByPk(id, { include: ["Pincodes"] });
		if (!city) {
			return res.json({
				status: false,
				message: "City not found",
			});
		}

		city.name = name;
		city.airport_id = airport_id?airport_id:null;
		console.log("airport_id", airport_id);
		city.distance = airport_id? distance:0;
		city.hotel = hotel;
		await city.save();

		// Process Pincodes
		const existingPincodeIds = city.Pincodes.map((p) => p.id);
		const incomingPincodeIds = Pincodes.filter((p) => p.id).map((p) => p.id);

		// 1. Delete pincodes not in incoming data
		const toDelete = existingPincodeIds.filter(
			(id) => !incomingPincodeIds.includes(id)
		);
		if (toDelete.length > 0) {
			await Pincode.destroy({ where: { id: toDelete, city_id: id } });
		}

		// // 2. Bulk update existing pincodes
		// const toUpdate = Pincodes.filter((p) => p.id);
		// for (const pincode of toUpdate) {
		// 	await Pincode.update(
		// 		{ area_name: pincode.area_name, pincode: pincode.pincode },
		// 		{ where: { id: pincode.id, city_id: id } }
		// 	);
		// }

		// // 3. Bulk insert new pincodes
		// const toInsert = Pincodes.filter((p) => !p.id).map((p) => ({
		// 	area_name: p.area_name,
		// 	pincode: p.pincode,
		// 	city_id: id,
		// }));
		// if (toInsert.length > 0) {
		// 	await Pincode.bulkCreate(toInsert);
		// }
		// 1. Update existing Pincodes
		const toUpdate = Pincodes.filter((p) => p.id);
		for (const pincode of toUpdate) {
			await Pincode.update(
				{
					area_name: pincode.area_name,
					pincode: pincode.pincode,
				},
				{
					where: { id: pincode.id, city_id: id },
				}
			);
		}

		// 2. Prepare new entries (without id)
		const toInsert = Pincodes.filter((p) => !p.id);

		//  Step 1: Check for duplicates in input itself
		const seen = new Set();
		for (const p of toInsert) {
			const key = `${id}-${p.pincode}`;
			if (seen.has(key)) {
				return res.status(400).json({
					status: false,
					message: `Duplicate pincode "${p.pincode}" found in request body.`,
				});
			}
			seen.add(key);
		}

		//  Step 2: Check for duplicates in DB
		if (toInsert.length > 0) {
			const pincodesOnly = toInsert.map((p) => p.pincode);

			const existing = await Pincode.findAll({
				where: {
					// city_id: id,
					pincode: pincodesOnly,
				},
			});

			if (existing.length > 0) {
				const dup = existing[0];
				return res.status(200).json({
					status: false,
					message: `Pincode "${dup.pincode}" already exists in the database for this city.`,
				});
			}
		}

		// 3. Bulk insert if no duplicates
		const mappedInsert = toInsert.map((p) => ({
			area_name: p.area_name,
			pincode: p.pincode,
			city_id: id,
		}));

		if (mappedInsert.length > 0) {
			await Pincode.bulkCreate(mappedInsert);
		}

		const updatedRecords = [];

		for (const limit of booking_limits) {
			const existing = await BookingLimit.findOne({
				where: {
					city_id: id,
					vehicle_id: limit.vehicle_id,
					limit_date: null,
				},
			});

			if (existing) {
				await existing.update({ max_limit: limit.max_limit });
				updatedRecords.push(existing.id);
			} else {
				const created = await BookingLimit.create({
					city_id: id,
					vehicle_id: limit.vehicle_id,
					max_limit: limit.max_limit,
					limit_date: null,
				});
				updatedRecords.push(created.id);
			}
		}

		res.status(200).json({
			status: true,
			data: city,
			message: "City Updated Successfully",
		});
	} catch (error) {
		console.log("error".error)
		res.status(500).json({	
			status: false,
			message: error.message,
		});
	}
};

exports.getById = async (req, res) => {
	try {
		const { id } = req.params;
		// const data = await cities.findByPk(id);
		const data = await cities.findByPk(id, {
			include: [
				{
					model: Pincode,
					as: "Pincodes", // Use alias only if you defined it
				},
				{
					model: BookingLimit,
					as: "booking_limits",
					where: {
						limit_date: null,
					},
					required: false, // important to allow cities without any BookingLimits
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
exports.getCitiesByRentalPlan = async (req, res) => {
	try {
		const {
			local_rental_plan_id,
			search = "",
			page = 1,
			items_per_page = 50,
		} = req.query;

		if (!local_rental_plan_id) {
			return res.status(400).json({
				status: false,
				message: "local_rental_plan_id is required",
			});
		}

		// Step 1: Get distinct city_ids for given rental plan
		const pricingRecords = await LocalRentalPricing.findAll({
			attributes: ["city_id"],
			where: {
				local_rental_plan_id,
			},
			group: ["city_id"],
		});

		const cityIds = pricingRecords.map((p) => p.city_id);

		if (cityIds.length === 0) {
			return res.status(200).json({
				status: true,
				data: [],
				message: "No cities found for the given rental plan",
			});
		}

		// Step 2: Fetch matching cities
		const whereCondition = {
			id: { [Op.in]: cityIds },
			...(search && {
				name: { [Op.like]: `%${search}%` },
			}),
		};

		// const totalCount = await cities.count({ where: whereCondition });

		const pageNumber = parseInt(page, 10);
		const itemsPerPage = parseInt(items_per_page, 10);

		const { count, rows } = await cities.findAndCountAll({
			attributes: ["id", "name"],
			where: whereCondition,
			offset: (pageNumber - 1) * itemsPerPage,
			limit: itemsPerPage,
			order: [["name", "ASC"]],
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

		const CitiesWithIndex = rows.map((city, index) => ({
			...city.toJSON(),
			index_no: from + index,
		}));

		res.status(200).json({
			status: true,
			data: CitiesWithIndex,
			payload: { pagination },
			message: "Cities fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching cities by rental plan:", error);
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getAll = async (req, res) => {
	try {
		const {
			page = 1,
			items_per_page,
			search = "",
			airport_id,
			hotel,
		} = req.query;

		const totalCount = await cities.count();

		const pageNumber = parseInt(page, 10);
		const itemsPerPage = items_per_page
			? parseInt(items_per_page, 10)
			: totalCount;

		const whereCondition = {
			...(search && {
				[Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
			}),

			...(airport_id && {
				airport_id: airport_id,
			}),

			...(hotel && {
				hotel: hotel,
			}),
		};

		const { count, rows: Cities } = await cities.findAndCountAll({
			// include: [
			// 	{
			// 		model: Pincode,
			// 		attributes: ["id", "pincode"], // Include only Project Name
			// 		// ...(filter_projectid && {
			// 		// 	where: {
			// 		// 		id: {
			// 		// 			[Op.in]: Array.isArray(filter_projectid)
			// 		// 				? filter_projectid
			// 		// 				: [filter_projectid], // Support single or multiple roleIds
			// 		// 		},
			// 		// 	},
			// 		// }),
			// 	},
			// ],
			where: whereCondition,
			offset: (pageNumber - 1) * itemsPerPage,
			limit: itemsPerPage,
			order: [["name", "ASC"]],
		});

		const totalPages = Math.ceil(count / itemsPerPage);
		const from = (pageNumber - 1) * itemsPerPage + 1;
		const to = Math.min(pageNumber * itemsPerPage, count);

		const CitiesWithIndex = Cities.map((quotation, index) => ({
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
			data: CitiesWithIndex,
			payload: {
				pagination: pagination,
			},
			message: "Cities fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching Cities:", error);
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.deleteById = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await cities.findByPk(id);

		if (data) {
			const rentalPricing = await LocalRentalPricing.findOne({
				where: { city_id: id },
			});
			const airportPricing = await AirportPricing.findOne({
				where: { city_id: id },
			});
			if (rentalPricing || airportPricing) {
				res.status(200).json({
					status: false,
					message: `City is used somewhere!!`,
				});
			} else {
				await data.destroy();
				res.status(200).json({
					status: true,
					data: data,
					message: "City deleted successfully",
				});
			}
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

// Fetch all cities list and generate an Excel file
exports.exportCitiesPincode = async (req, res) => {
	try {
		// Fetch all expenses (without pagination)
		const users = await cities.findAll();

		// Convert expenses to plain JSON
		const citiesData = users.map((city, index) => ({
			ID: city.id,
			CityName: city?.name || "N/A",
			// Name: user.name,
			// Email: user.email,
			// Mobile_No: user?.mobile_no || "N/A",
			// Role: user.Roles[0]?.roleName || "N/A",
			// Designation: user?.designation || "N/A",
			// DateOfJoining: user?.dateOfJoining || "N/A",
			// AadharNumber: user?.aadharNumber || "N/A",
		}));

		// Generate Excel file
		const worksheet = XLSX.utils.json_to_sheet(citiesData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Cities");

		// // Define file path
		const fileName = `users_${Date.now()}.xlsx`;
		const filePath = path.join(__dirname, "../public/uploads", fileName);

		// // Ensure directory exists
		if (!fs.existsSync(path.dirname(filePath))) {
			fs.mkdirSync(path.dirname(filePath), { recursive: true });
		}

		// // Write file to disk
		XLSX.writeFile(workbook, filePath);

		// Save file to temporary path
		// const filePath = path.join(
		// 	__dirname,
		// 	"../exports",
		// 	`expenses_${Date.now()}.xlsx`
		// );
		// XLSX.writeFile(workbook, filePath);

		// Send file to client
		return res.download(filePath, "cities.xlsx", (err) => {
			if (err) {
				console.error("File Download Error:", err);
				res.status(500).json({
					message: "Error downloading file",
				});
			}
			// Delete file after download
			// setTimeout(() => fs.unlinkSync(filePath), 5000);
		});

		// Respond with file download link
		res.status(200).json({
			status: true,
			message: "Expenses exported successfully",
			file_url: `${req.protocol}://${req.get("host")}/uploads/${fileName}`,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.importPincodes = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				status: false,
				message: "No file uploaded",
			});
		}

		const { city_id } = req.params;

		// Read the uploaded Excel file
		const workbook = XLSX.readFile(req.file.path);
		const sheetName = workbook.SheetNames[0];
		let sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

		// Remove 'error' column if it exists
		sheetData = sheetData.map(({ error, ...row }) => row);

		// Validation schema
		const schema = Joi.object({
			pincode: Joi.number().integer().min(100000).max(999999).required(),
			area_name: Joi.string().max(100).required(),
		});

		const errors = [];
		const pincodesToInsert = [];

		// Fetch existing pincodes from DB for uniqueness check
		const existingPincodes = await Pincode.findAll({
			attributes: ["pincode"],
			where: { city_id },
		});
		const existingPincodeSet = new Set(existingPincodes.map((p) => p.pincode));

		for (const row of sheetData) {
			const { error } = schema.validate(row);
			if (error) {
				errors.push({
					...row,
					error: error.details.map((x) => x.message).join(", "),
				});
			} else if (existingPincodeSet.has(row.pincode)) {
				errors.push({
					...row,
					error: `Duplicate pincode: ${row.pincode}`,
				});
			} else {
				// Add to insert array
				pincodesToInsert.push({
					city_id,
					pincode: row.pincode,
					area_name: row.area_name,
				});
				existingPincodeSet.add(row.pincode); // Add to set to avoid duplicates in same upload
			}
		}

		// Bulk insert valid records
		if (pincodesToInsert.length > 0) {
			await Pincode.bulkCreate(pincodesToInsert);
		}

		// Delete uploaded file
		fs.unlinkSync(req.file.path);

		// Handle validation errors
		if (errors.length > 0) {
			const formattedErrors = errors.map((err) => ({
				pincode: err.pincode || "",
				area_name: err.area_name || "",
				error: err.error,
			}));

			const errorSheet = XLSX.utils.json_to_sheet(formattedErrors);
			const errorWorkbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(errorWorkbook, errorSheet, "Errors");

			const errorFilePath = path.join(
				__dirname,
				`../public/errors-${Date.now()}.xlsx`
			);
			XLSX.writeFile(errorWorkbook, errorFilePath);

			return res.status(200).json({
				status: true,
				message: `${errors.length} rows failed validation. See the attached error sheet.`,
				errorFile: `/${path.basename(errorFilePath)}`,
			});
		}

		// Success response
		res.status(200).json({
			status: true,
			message: `${pincodesToInsert.length} pincodes imported successfully.`,
		});
	} catch (err) {
		console.error("Error during import:", err);
		res.status(500).json({
			status: false,
			message: err.message,
		});
	}
};

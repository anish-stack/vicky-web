const Joi = require("joi");
const { Transaction, User, Vehicle, Trip } = require("../models");
const PDFDocument = require("pdfkit");
const path = require("path");
const { toWords } = require("number-to-words");
const moment = require("moment");
const { Sequelize, Op } = require("sequelize");

function capitalizeWords(input) {
	return input
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

const generateUniqueInvoiceId = async () => {
	let invoiceId;
	let isUnique = false;

	while (!isUnique) {
		const timestamp = Date.now().toString().slice(-5);
		const randomNum = Math.floor(1000 + Math.random() * 9000);
		invoiceId = `${timestamp}${randomNum}`;
		const existingTransaction = await Transaction.findOne({
			where: { invoice_id: invoiceId },
		});
		if (!existingTransaction) {
			isUnique = true;
		}
	}
	return invoiceId;
};

exports.createTransaction = async (req, res) => {
	try {
		let {
			payment_id,
			vehicle_id,
			trip_id,
			name,
			pickup_address,
			vehicle_name,
			extra_km,
			toll_tax,
			parking_charges,
			driver_charges,
			night_charges,
			fuel_charges,
			user_id,
			original_amount,
			paid_amount,
			currency,
			status,
			order_id,
			method,
			card,
			upi,
			bank,
			wallet,
			email,
			contact,
			error_description,
			error_reason,
			acquirer_data,
			all_details,
			places,
			departure_date,
			return_date,
			distance,
			trip_type,
			category,
			city_id,
			local_rental_plan_id,
			airport_id,
			airport_city_id,
			airport_from_to,
			car_tab,
			dham_package_name,
			dham_pickup_city_name,
			dham_package_id,
			dham_pickup_city_id,
			dham_package_days,
			dham_category_id,
			dham_category_name,
		} = req.body;
		const Schema = Joi.object({
			payment_id: Joi.string().required().messages({
				"string.empty": "Payment id is required",
				"any.required": "Payment id is required",
			}),
			vehicle_id: Joi.string().required().messages({
				"string.empty": "Vehicle id is required",
				"any.required": "Vehicle id is required",
			}),
			user_id: Joi.string().required().messages({
				"string.empty": "User id is required",
				"any.required": "User id is required",
			}),
			trip_id: Joi.string().required().messages({
				"string.empty": "Vehicle id is required",
				"any.required": "Vehicle id is required",
			}),
			places: Joi.array()
				.required()
				// .items(
				//     Joi.object({
				//         label: Joi.string().required(),
				//         value: Joi.string().required(),
				//     })
				// )
				.when("trip_type", {
					is: "local",
					then: Joi.array().min(1),
					otherwise: Joi.array().min(2),
				})
				.messages({
					"array.min": "Please select the places",
					"any.required": "Please select the places",
				}),
			city_id: Joi.alternatives().conditional("trip_type", {
				is: "local",
				then: Joi.number().required().messages({
					"any.required": "City is required.",
					"number.base": "City ID must be a valid number.",
				}),
				otherwise: Joi.number().optional().allow(null).messages({
					"number.base": "City ID must be a valid number.",
				}),
			}),
			local_rental_plan_id: Joi.alternatives().conditional("trip_type", {
				is: "local",
				then: Joi.number().required().messages({
					"any.required": "Plan is required.",
					"number.base": "Plan must be a valid number.",
				}),
				otherwise: Joi.number().optional().allow(null).messages({
					"number.base": "Plan must be a valid number.",
				}),
			}),
			airport_id: Joi.alternatives().conditional("tripType", {
				is: "airport",
				then: Joi.number().required().messages({
					"any.required": "Airport is required.",
					"number.base": "Airport ID must be a valid number.",
				}),
				otherwise: Joi.number().optional().allow(null).messages({
					"number.base": "Airport ID must be a valid number.",
				}),
			}),
			airport_city_id: Joi.alternatives().conditional("tripType", {
				is: "airport",
				then: Joi.number().required().messages({
					"any.required": "Please select a city",
					"number.base": "city must be a valid number",
				}),
				otherwise: Joi.number().optional().allow(null).messages({
					"number.base": "city must be a valid number",
				}),
			}),
			airport_from_to: Joi.alternatives().conditional("tripType", {
				is: "airport",
				then: Joi.string().required().messages({
					"any.required": "Please select from/to",
					"string.base": "Please select from/to",
				}),
				otherwise: Joi.string().optional().allow(null).messages({
					"string.base": "Please select from/to",
				}),
			}),
			distance: Joi.string().allow(null, "").optional().messages({
				"string.empty": "Distance is required",
				"any.required": "Distance is required",
			}),
			trip_type: Joi.string().allow(null, "").optional().messages({
				"string.empty": "Trip Type is required",
				"any.required": "Trip Type is required",
			}),
			method: Joi.string().required().messages({
				"string.empty": "Method is required",
				"any.required": "Method is required",
			}),
		}).unknown(true);

		const { error } = Schema.validate(req.body, { abortEarly: false });
		if (error) {
			console.log("error in transaction", error);
			return res.json({
				status: false,
				message: error?.details[0]?.message,
			});
		}

		const invoiceId = await generateUniqueInvoiceId();

		// const OTP = Math.floor(1000 + Math.random() * 9000).toString();
		// const expires_at = new Date(Date.now() + 10 * 60 * 1000);

		// const existingOTP = await otp.findOne({
		//   where: { phone_number: req.user?.phone_number, trip_id: trip_id },
		// });
		// console.log(JSON.stringify(existingOTP, null, 2));
		// if (existingOTP && existingOTP.otp_type === "start_trip") {
		//   console.log("update");
		//   await existingOTP.update({ otp: OTP, expires_at });
		// } else {
		// console.log("Create");
		// await otp.create({
		//   phone_number: req.user?.phone_number,
		//   trip_id: trip_id,
		//   otp: OTP,
		//   otp_type: "start_trip",
		//   expires_at,
		// });
		// }

		const data = await Transaction.create({
			payment_id,
			vehicle_id,
			trip_id,
			name,
			pickup_address,
			vehicle_name,
			extra_km,
			toll_tax,
			parking_charges,
			driver_charges,
			night_charges,
			fuel_charges,
			user_id,
			original_amount,
			paid_amount,
			currency,
			status,
			order_id,
			method,
			card,
			upi,
			bank,
			wallet,
			email,
			contact,
			error_description,
			error_reason,
			acquirer_data,
			all_details,
			places,
			departure_date,
			return_date,
			distance,
			trip_type,
			category,
			city_id,
			local_rental_plan_id,
			airport_id,
			airport_city_id,
			airport_from_to,
			invoice_id: invoiceId,
			car_tab,
			dham_package_name,
			dham_pickup_city_name,
			dham_package_id,
			dham_pickup_city_id,
			dham_package_days,
			dham_category_id,
			dham_category_name,
		});

		res.status(200).json({
			status: true,
			data: data,
			message: "Transaction Created Successfully",
		});
	} catch (error) {
		console.log("error", error);
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getAllTransactions = async (req, res) => {
	try {
		const {
			page = 1,
			items_per_page = 10,
			search = "",
			userId,
			tripStatus,
			filter_tripstatus,
			filter_vehicle_id,
			filter_start_pickup_date,

		} = req.query;
		const pageNumber = parseInt(page, 10);
		const itemsPerPage = parseInt(items_per_page, 10);

		const whereCondition = {
			...(search && {
				[Op.or]: [
					{ invoice_id: { [Op.like]: `%${search}%` } },
					// trip_id as formatted 'TS001'
					Sequelize.where(
						Sequelize.fn(
							"CONCAT",
							"TS",
							Sequelize.fn("LPAD", Sequelize.col("trip_id"), 3, "0")
						),
						{
							[Op.like]: `%${search}%`,
						}
					),
				],
			}),

			...(userId && {
				user_id: userId,
			}),

			...(tripStatus && {
				trip_status: tripStatus,
			}),
			...(filter_tripstatus && {
				trip_status: filter_tripstatus,
			}),
			...(filter_vehicle_id && {
				vehicle_id: filter_vehicle_id,
			}),
			// ...(filter_start_pickup_date 
			// 	? {
			// 			departure_date: {
			// 				...(filter_start_pickup_date && {
			// 					[Op.gte]: new Date(filter_start_pickup_date),
			// 				}),
			// 				...(filter_start_pickup_date && {
			// 					[Op.lte]: new Date(
			// 						new Date(filter_start_pickup_date).setHours(23, 59, 59, 999)
			// 					),
			// 				}),
			// 			},
			// 	  }
			// 	: {}),
		};


		if (filter_start_pickup_date) {
			const toUTC = (localDate) => {
				return new Date(
					localDate.getTime() - localDate.getTimezoneOffset() * 60000
				);
			};
			// 	const localStart = new Date(filter_start_pickup_date);
			// 	localStart.setHours(0, 0, 0, 0);

			// 	const localEnd = new Date(filter_start_pickup_date);
			// 	localEnd.setHours(23, 59, 59, 999);

			// 	whereCondition.departure_date = {
			// 		[Op.gte]: toUTC(localStart),
			// 		[Op.lte]: toUTC(localEnd),
			// 	};
			console.log("filter_start_pickup_date", filter_start_pickup_date);
			const localStart = new Date(filter_start_pickup_date);
			localStart.setHours(0, 0, 0, 0);
			console.log("localStart", localStart);


			const localEnd = new Date(filter_start_pickup_date);
			localEnd.setHours(23, 59, 59, 999);

			whereCondition.departure_date = {
				[Op.gte]: localStart.toISOString().slice(0, 19),
				[Op.lte]: localEnd.toISOString().slice(0, 19),
			};

		}


		console.log("whereCondition", whereCondition);
		const { count, rows: transactions } = await Transaction.findAndCountAll({
			where: whereCondition,
			offset: (pageNumber - 1) * itemsPerPage,
			limit: itemsPerPage,
			order: [["createdAt", "DESC"]],
		});

		const totalPages = Math.ceil(count / itemsPerPage);
		const from = (pageNumber - 1) * itemsPerPage + 1;
		const to = Math.min(pageNumber * itemsPerPage, count);

		const transactionsWithIndex = transactions.map((quotation, index) => ({
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
			data: transactionsWithIndex,
			payload: {
				pagination: pagination,
			},
			message: "transactions fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching transactions:", error);
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getById = async (req, res) => {
	try {
		const { id } = req.params;
		console.log("Id", id);
		const data = await Transaction.findOne({
			where: { id: id },
			include: [
				{
					model: Vehicle,
					// where: whereCondition, // Apply the role-based condition
					// attributes: [], // Exclude quotation details from the result
				},
			],
		});
		console.log(JSON.stringify(data, null, 2));
		if (data) {
			res.status(200).json({
				status: true,
				data: data,
				message: "Transaction Details Fetched",
			});
		} else {
			res.status(200).json({
				status: false,
				message: "Transaction Not Found",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.generatePDF = async (req, res) => {
	const { id } = req.params;

	const data = await Transaction.findByPk(id);

	console.log("Data", JSON.stringify(data, null, 2));

	if (data) {
		const user = await User.findByPk(data.user_id);

		const Oldplaces = JSON.parse(data?.places);
		// const places = JSON.parse(data?.places);

		const places = Oldplaces.map((place) => {
			// If 'label' already exists, leave as is
			if ("label" in place) return place;

			// Else, replace 'name' with 'label'
			const { name, ...rest } = place;
			return {
				...rest,
				label: name,
			};
		});

		console.log("Places", places);
		const PDFDocument = require("pdfkit");

		function formatDateTime(inputDateTime) {
			const date = new Date(inputDateTime);

			// Get parts
			const day = date.getDate();
			const month = date.getMonth() + 1; // Months are 0-indexed
			const year = date.getFullYear();

			let hours = date.getHours();
			const minutes = date.getMinutes();

			// AM or PM
			const ampm = hours >= 12 ? "PM" : "AM";

			// Convert 24h to 12h
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'

			// Format minutes (add leading zero if needed)
			const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

			// Final formatted string
			return `${day}-${month}-${year}, ${hours}:${formattedMinutes} ${ampm}`;
		}

		// const doc = new PDFDocument({
		//   margins: {
		//     top: 72,
		//     bottom: 72,
		//     left: 50,
		//     right: 50,
		//   },
		//   // width: 841.89,
		//   // height: 1190.55,
		// });

		// Passing size to the constructor
		const doc = new PDFDocument({
			size: "A4",
			margins: {
				top: 65,
				left: 50,
				bottom: 10,
				right: 50,
			},
		});

		// console.log(doc);

		// Passing size to the addPage function
		// doc.addPage({ size: "A4" });

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", 'inline; filename="generated.pdf"');

		doc.pipe(res);

		const fontPath1 = path.join(__dirname, "..", "fonts", "NotoSans.ttf");
		const fontPath = path.join(__dirname, "..", "public", "fonts");

		doc.font(fontPath1);

		const pageWidth = doc.page.width;

		// taxisuffer logo
		const imagePath = path.join(
			__dirname,
			"..",
			"public",
			"logos",
			"taxisafar-logo.png"
		);

		doc.image(imagePath, doc.page.margins.left, 40, {
			width: 120,
			height: 20,
		});
		//----------------------------------

		// tax invoice text
		const text = "TAX INVOICE";
		const fontSize = 20;
		doc.fontSize(fontSize);

		// const x = pageWidth - doc.page.margins.right - 130;
		const x = doc.x;
		const y = 40;

		// doc.font(fontSemiBoldPath).text(text, x, y, { underline: false });
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.text(text, x, y, { align: "right" });

		//---------------------------------------------------
		const underlineY = doc.y + 8;
		doc
			.strokeColor("lightgray")
			.lineWidth(1)
			.moveTo(doc.page.margins.left, underlineY)
			.lineTo(doc.page.width - doc.page.margins.right, underlineY)
			.stroke();

		//-----------------------------------------------
		//Invoice From Text
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Bold.ttf"))
			.fontSize(10)
			.text(`Invoice From`, doc.page.margins.left, doc.y + 20);

		//---------------------------------------------------------------------------------
		//Address
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`VCS Fleet Private Limited`, doc.page.margins.left, doc.y + 7);
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(
				`120/60 Unione Residency Rahul Vihar Ghaziabad`,
				doc.page.margins.left,
				doc.y + 1
			);
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`Uttar Pradesh, India, 201009`, doc.page.margins.left, doc.y + 1);
		//------------------------------------------------------------------
		// CIN
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.text(`CIN:${" "}`, doc.page.margins.left, doc.y + 5, {
				continued: true,
			});

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`U49224UP2025PTC218923`);
		//--------------------------------------------------------------------
		//GST
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.text(`GST:`, doc.page.margins.left, doc.y + 5, { continued: true });

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`09AAKCV8493P1Z1`);
		//---------------------------------------------------------------
		//underline
		doc
			.strokeColor("lightgray")
			.lineWidth(1)
			.moveTo(doc.page.margins.left, doc.y + 5)
			.lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
			.stroke();
		//----------------------------------------------------------------

		//Invoioce no
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.text(
				`Invoice No. ${"   "}:`,
				pageWidth - doc.page.margins.right - 170,
				doc.page.margins.top + 20
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(
				` ${data?.invoice_id}`,
				// pageWidth - doc.page.margins.right - 80,
				doc.x,
				doc.page.margins.top + 20,
				{ align: "right" }
			);

		// // Invoice Date
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.text(
				`Invoice Date ${"   "}:`,
				pageWidth - doc.page.margins.right - 175,
				doc.page.margins.top + 35
			);
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(
				formatDateTime(data?.createdAt),
				// pageWidth - doc.page.margins.right - 80,
				doc.x,
				doc.page.margins.top + 35,
				{ align: "right" }
			);
		//-----------------------------------------------------------------------
		//Order id
		// doc
		//   .font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
		//   .fontSize(10)
		//   .text(
		//     `Order Id. ${"      "}:`,
		//     pageWidth - doc.page.margins.right - 160,
		//     doc.page.margins.top + 30
		//   );

		// doc
		//   .font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
		//   .fontSize(10)
		//   .text(
		//     ` ${data?.order_id}`,
		//     // pageWidth - doc.page.margins.right - 80,
		//     doc.x,
		//     doc.page.margins.top + 30,
		//     { align: "right" }
		//   );
		//-----------------------------------------------------------
		//------------------ third section-------------------------------//
		//Invoice From Text
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Bold.ttf"))
			.fontSize(10)
			.text(`Invoice To`, doc.page.margins.left, doc.y + 73);

		//---------------------------------------------------------------------------------
		//Address
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`${(data?.name) ? data?.name.charAt(0).toUpperCase() + data?.name.slice(1) : ""}`, doc.page.margins.left, doc.y + 7);
		// doc
		// 	.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
		// 	.fontSize(10)
		// 	.text(`${data?.email}`, doc.page.margins.left, doc.y + 1.5);
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`${data?.contact}`, doc.page.margins.left, doc.y + 3);
		//------------------------------------------------------------------
		// // Invoice Date
		// doc
		// 	.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
		// 	.fontSize(10)
		// 	.text(
		// 		`Invoice Date ${"   "}:`,
		// 		pageWidth - doc.page.margins.right - 175,
		// 		doc.page.margins.top + 123
		// 	);
		// doc
		// 	.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
		// 	.fontSize(10)
		// 	.text(
		// 		formatDateTime(data?.createdAt),
		// 		// pageWidth - doc.page.margins.right - 80,
		// 		doc.x,
		// 		doc.page.margins.top + 123,
		// 		{ align: "right" }
		// 	);

		// SAC Code
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.text(
				`SAC Code ${"   "}:`,
				pageWidth - doc.page.margins.right - 166,
				doc.page.margins.top + 123
			);
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(
				996601,
				// pageWidth - doc.page.margins.right - 80,
				doc.x,
				doc.page.margins.top + 123,
				{ align: "right" }
			);
		//--------------------------------------------------------------------
		//Place of Supply
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.text(
				`Place of Supply ${"   "}:`,
				pageWidth - doc.page.margins.right - 188,
				doc.page.margins.top + 139
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(
				`Delhi`,
				// pageWidth - doc.page.margins.right - 80,
				doc.x,
				doc.page.margins.top + 139,
				{ align: "right" }
			);
		//---------------------------------------------------------------
		// HSN Code
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.text(
				`Booking ID ${"   "}:`,
				pageWidth - doc.page.margins.right - 166,
				doc.page.margins.top + 157
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(
				`TS${String(data?.trip_id).padStart(3, "0")}`,
				// pageWidth - doc.page.margins.right - 80,
				doc.x,
				doc.page.margins.top + 157,
				{ align: "right" }
			);
		//--------------------------------------------------------------------
		//underline
		doc
			.strokeColor("lightgray")
			.lineWidth(1)
			.moveTo(doc.page.margins.left, doc.y + 5)
			.lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
			.stroke();
		//----------------------------------------------------------------
		//----------------Fourth Section--------------------------------//
		// Trip detail text
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Bold.ttf"))
			.fontSize(10)
			.text(`Trip Details`, doc.page.margins.left, doc.y + 10);

		//---------------------------------------------------------------------------------
		//  Pickup date and time
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`Pickup Date & Time:`, doc.page.margins.left, doc.y + 5);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(
				formatDateTime(data?.departure_date),
				doc.page.margins.left + 90,
				doc.y - 11
			);
		function getTripTypeLabel(data) {
			if (data.trip_type === "airport") {
				return "Airport Booking";
			} else if (data.car_tab === "chardham" && data.dham_category_name == "1 Dham") {
				return "One Dham Yatra";
			} else if (data.car_tab === "chardham" && data.dham_category_name == "2 Dham") {
				return "Two Dham Yatra";
			} else if (data.car_tab === "chardham" && data.dham_category_name == "4 Dham") {
				return "Four Dham Yatra";
			} else if (data.trip_type === "local") {
				return "Local Rental";
			} else if (data.trip_type === "oneWay") {
				return "One Way";
			} else if (data.trip_type === "roundTrip") {
				return "Round Trip";
			} else {
				return null;
			}
		}
		//---------------------------------------------------------------------------------
		// Round trip or one way trip (Later based on condition)
		// const tripTypeLabel = getTripTypeLabel(data) || "N/A";
		// doc
		// 	.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
		// 	.fontSize(10)
		// 	.text(`${tripTypeLabel} -`, doc.page.margins.left, doc.y);
		// doc
		// 	.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
		// 	.fontSize(10)
		// 	.text(
		// 		`${data?.dham_package_days!=null ? data?.dham_package_days +', ':''} ${data?.distance} `,
		// 		doc.page.margins.left + 55,
		// 		doc.y - 12
		// 	);
		// 1. Draw the first part: trip type
		const tripTypeLabel = getTripTypeLabel(data) || "N/A";

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(`${tripTypeLabel} - `, doc.page.margins.left, doc.y, {
				continued: true,
			});

		// 2. Draw the second part right after it
		const extraInfo = `${data?.dham_package_days != null ? data?.dham_package_days + " day, " : ""
			}${data?.distance || ""}`;

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(extraInfo);

		//---------------------------------------------------------------------------------

		const lineX = doc.page.margins.left + 8;
		const circleRadius = 4;
		const labelIndent = 20;
		let startY = doc.y + 10;
		let previousCircleY = null;

		if (places.length > 2) {
			// Draw Start Location
			const startPlace = places[0];
			let circleY = startY + 6;

			// Draw start square (■)
			doc
				.rect(
					lineX - circleRadius,
					circleY - circleRadius,
					circleRadius * 2,
					circleRadius * 2
				)
				.fillColor("black")
				.fill();

			let labelX = doc.page.margins.left + labelIndent;
			doc.fontSize(10).text(startPlace.label, labelX, startY, {
				width: doc.page.width - labelX - doc.page.margins.right,
			});

			let labelHeight = doc.heightOfString(startPlace.label, {
				width: doc.page.width - labelX - doc.page.margins.right,
			});

			previousCircleY = circleY;
			startY += labelHeight + 5;

			// Draw Middle Circle for Multi Stop
			circleY = startY + 6;

			doc.circle(lineX, circleY, circleRadius).fillColor("black").fill();

			let labelText;

			if (data.car_tab === "chardham") {
				labelText = data.dham_package_name || ""; // fallback to empty string if null
			} else {
				labelText = `${places.length - 2} Multi Stop`;
			}

			doc.fontSize(10).text(labelText, labelX, startY, {
				width: doc.page.width - labelX - doc.page.margins.right,
			});

			labelHeight = doc.heightOfString(labelText, {
				width: doc.page.width - labelX - doc.page.margins.right,
			});



			// doc.fontSize(10).text(`${places.length - 2} Multi Stop`, labelX, startY, {
			// 	width: doc.page.width - labelX - doc.page.margins.right,
			// });

			// labelHeight = doc.heightOfString(`${places.length - 2} Multi Stop`, {
			// 	width: doc.page.width - labelX - doc.page.margins.right,
			// });

			// Draw vertical line between start -> multi stop
			const lineStartY = previousCircleY + circleRadius;
			const lineEndY = circleY - circleRadius;
			doc
				.moveTo(lineX, lineStartY)
				.lineTo(lineX, lineEndY)
				.lineWidth(1)
				.strokeColor("black")
				.stroke();

			previousCircleY = circleY;
			startY += labelHeight + 5;

			// Draw End Location
			const endPlace = places[places.length - 1];
			circleY = startY + 6;

			doc
				.rect(
					lineX - circleRadius,
					circleY - circleRadius,
					circleRadius * 2,
					circleRadius * 2
				)
				.fillColor("black")
				.fill();

			doc.fontSize(10).text(endPlace.label, labelX, startY, {
				width: doc.page.width - labelX - doc.page.margins.right,
			});

			labelHeight = doc.heightOfString(endPlace.label, {
				width: doc.page.width - labelX - doc.page.margins.right,
			});

			// Draw line between multi stop -> end
			doc
				.moveTo(lineX, previousCircleY + circleRadius)
				.lineTo(lineX, circleY - circleRadius)
				.lineWidth(1)
				.strokeColor("black")
				.stroke();
		} else {
			// Only Start and End when places.length <= 2
			places.forEach((place, index) => {
				const circleY = startY + 6;

				// Draw start and end square (■)
				doc
					.rect(
						lineX - circleRadius,
						circleY - circleRadius,
						circleRadius * 2,
						circleRadius * 2
					)
					.fillColor("black")
					.fill();

				const labelX = doc.page.margins.left + labelIndent;
				doc.fontSize(10).text(place.label, labelX, startY, {
					width: doc.page.width - labelX - doc.page.margins.right,
				});

				const labelHeight = doc.heightOfString(place.label, {
					width: doc.page.width - labelX - doc.page.margins.right,
				});

				if (index === 0 && places.length > 1) {
					// draw line between start and end
					doc
						.moveTo(lineX, circleY + circleRadius)
						.lineTo(lineX, circleY + labelHeight + 5 - circleRadius)
						.lineWidth(1)
						.strokeColor("black")
						.stroke();
				}

				startY += labelHeight + 5;
			});
		}

		// Ride with text
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Bold.ttf"))
			.fontSize(10)
			.text(``, doc.x, doc.page.margins.top + 205, {
				align: "right",
			});

		//---------------------------------------------------------------------------------
		// License Plate
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.text(``, pageWidth - doc.page.margins.right - 120, doc.y + 2, {
				continued: true,
			});

		// doc
		//   .font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
		//   .fontSize(10)
		//   .text(`GJ27TF3662`, { align: "right" });

		//---------------------------------------------------------------------------------

		const backAmountY2 = places.length > 2 ? doc.y + 105 : doc.y + 90;
		const backgroundAmountHeight = 20;

		const gapAboveAmountText = 16;

		const textAmountY =
			backAmountY2 + backgroundAmountHeight / 2 - gapAboveAmountText / 2;
		doc
			.rect(
				doc.page.margins.left,
				backAmountY2,
				pageWidth - doc.page.margins.left - doc.page.margins.right,
				backgroundAmountHeight
			)
			.fillColor("#e6e6e6")
			.fill();

		doc
			.fillColor("black")
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(11)
			.text("Total Trip Km", doc.page.margins.left + 10, textAmountY);

		doc
			.fillColor("black")
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(11)
			.text(`${data?.distance ? data?.distance : ' '}`, doc.page.margins.left - 10, textAmountY, {
				align: "right",
				width: pageWidth - doc.page.margins.left - doc.page.margins.right,
			});

		const tripFareValueHeight = doc.y + 15;
		const extrakmCharge =
			data?.extra_km * Number(data?.additional_kilometers || 0);
		const formattedExtrakmCharge = extrakmCharge.toFixed(2);

		const extratimeCharge =
			Number(data?.additional_time_charge || 0) *
			Number(data?.additional_time || 0);
		const formattedExtratimeCharge = extratimeCharge.toFixed(2);
		console.log(
			"extratimeCharge",
			extratimeCharge,
			data?.additional_time_charge,
			data?.additional_time
		);

		const totalNetAmount =
			data?.original_amount - 0 + extrakmCharge + extratimeCharge;
		const taxPercent = 2.5;
		const taxAmount = (totalNetAmount * taxPercent) / 100;
		const totalAmountWithTax = (
			Number(data?.original_amount) +
			extrakmCharge +
			extratimeCharge+
			2*taxAmount
		).toFixed(2);

		const totalPayableAmountWithTax = Number(
			totalAmountWithTax - data?.paid_amount
		).toFixed(2);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Trip Fare Value ${"   "} :`,
				pageWidth - doc.page.margins.right - 220,
				tripFareValueHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`₹${data?.original_amount}`,
				// `₹${data?.original_amount - 2 * taxAmount}`,
				doc.x,
				tripFareValueHeight,
				{
					align: "right",
				}
			);

		const taxHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Toll & State Tax ${"   "} :`,
				pageWidth - doc.page.margins.right - 223,
				taxHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`${data?.toll_tax ? "Included" : "Not Included"}`,
				doc.x,
				taxHeight,
				{ align: "right" }
			);

		const parkingHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Parking Charges ${"   "} :`,
				pageWidth - doc.page.margins.right - 227,
				parkingHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`${data?.parking_charges ? "Included" : "Not Included"}`,
				doc.x,
				parkingHeight,
				{ align: "right" }
			);

		const driverHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Driver Charges ${"   "} :`,
				pageWidth - doc.page.margins.right - 220,
				driverHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`${data?.driver_charges ? "Included" : "Not Included"}`,
				doc.x,
				driverHeight,
				{ align: "right" }
			);

		const nigthHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Night Charges ${"   "} :`,
				pageWidth - doc.page.margins.right - 218,
				nigthHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`${data?.night_charges ? "Included" : "Not Included"}`,
				doc.x,
				nigthHeight,
				{ align: "right" }
			);

		const fuelHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Fuel Charges ${"   "} :`,
				pageWidth - doc.page.margins.right - 213,
				fuelHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`${data?.fuel_charges ? "Included" : "Not Included"}`,
				doc.x,
				fuelHeight,
				{ align: "right" }
			);

		const extraKmChargeHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Extra Km Charges ${"   "} :`,
				pageWidth - doc.page.margins.right - 233,
				extraKmChargeHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`${formattedExtrakmCharge ? "₹" + formattedExtrakmCharge : "0.00"}`,
				doc.x,
				extraKmChargeHeight,
				{ align: "right" }
			);

		const extraTimeChargeHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Extra Time Charges ${"   "} :`,
				pageWidth - doc.page.margins.right - 240,
				extraTimeChargeHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`${formattedExtratimeCharge ? "₹" + formattedExtratimeCharge : "0.00"}`,
				doc.x,
				extraTimeChargeHeight,
				{ align: "right" }
			);
		// }
		//--------------------------------------------------------------------
		//underline
		doc
			.strokeColor("lightgray")
			.lineWidth(1)
			.moveTo(doc.page.margins.left, doc.y + 10)
			.lineTo(doc.page.width - doc.page.margins.right, doc.y + 10)
			.stroke();
		//----------------------------------------------------------------
		//---------------Sixth section ----------------------------------

		const cgstHeight = doc.y + 20;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Total CGST 2.5% ${"   "} :`,
				pageWidth - doc.page.margins.right - 230,
				cgstHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(`₹${taxAmount.toFixed(2)}`, doc.x, cgstHeight, { align: "right" });

		const sgstHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Total SGST 2.5% ${"   "} :`,
				pageWidth - doc.page.margins.right - 229,
				sgstHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(`₹${taxAmount.toFixed(2)}`, doc.x, sgstHeight, { align: "right" });

		const totalNetAmtHeight = doc.y + 5;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				`Total Net Amount ${"   "} :`,
				pageWidth - doc.page.margins.right - 235,
				totalNetAmtHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(`₹${totalAmountWithTax}`, doc.x, totalNetAmtHeight, {
				align: "right",
			});
		const tripAdvancePaidHeight = doc.y + 4;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				` Advance Paid ${"     "} :`,
				pageWidth - doc.page.margins.right - 220,
				tripAdvancePaidHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(`₹${data?.paid_amount}`, doc.x, tripAdvancePaidHeight, {
				align: "right",
			});
		const tripPayableAmountHeight = doc.y + 4;
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(
				` Total Amount Payable ${"     "} :`,
				pageWidth - doc.page.margins.right - 254,
				tripPayableAmountHeight
			);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(10)
			.text(`₹${totalPayableAmountWithTax}`, doc.x, tripPayableAmountHeight, {
				align: "right",
			});

		//-------------------------------------------------------
		//----------Seven Section------------------------------

		const textAmountToal = doc.y + 12;
		doc
			.rect(
				doc.page.margins.left,
				doc.y + 10,
				pageWidth - doc.page.margins.left - doc.page.margins.right,
				20
			)
			.fillColor("#e6e6e6")
			.fill();

		doc
			.fillColor("black")
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(11)
			.text("Total Amount Payable", doc.page.margins.left + 10, textAmountToal);

		doc
			.fillColor("black")
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(11)
			.text(
				`₹${totalPayableAmountWithTax}`,
				doc.page.margins.left - 10,
				textAmountToal,
				{
					align: "right",
					width: pageWidth - doc.page.margins.left - doc.page.margins.right,
				}
			);

		const amount = totalPayableAmountWithTax ?? 0;
		const amountInWords = toWords(amount);
		const formattedAmountInWords = capitalizeWords(amountInWords);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(11)
			.text(
				`Amounts In Words:-  ${formattedAmountInWords} Only`,
				doc.page.margins.left + 10,
				doc.y + 10
			);
		//--------------------------------------------------------------------
		//underline
		doc
			.strokeColor("lightgray")
			.lineWidth(1)
			.moveTo(doc.page.margins.left, doc.y + 5)
			.lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
			.stroke();
		//----------------------------------------------------------------
		//------------Eights Section------------------
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.fillColor("black")
			.fontSize(11)
			.text(`Terms & Conditions:`, doc.page.margins.left, doc.y + 10);

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(10)
			.fillColor("black")
			.text(
				`If you have any issues or queries in respect of your trip, please contact customer chat support through the TaxiSafar platform or drop in email at `,
				doc.page.margins.left,
				doc.y + 5,
				{ continued: true }
			);
		doc
			.font(path.join(fontPath, "SF-Pro-Display-Semibold.ttf"))
			.fontSize(10)
			.fillColor("black")
			.text(`contact@taxisafar.com`);

		// sign logo
		const signImagePath = path.join(
			__dirname,
			"..",
			"public",
			"logos",
			"sign1.png"
		);

		doc.image(signImagePath, doc.page.margins.left + 20, doc.y + 10, {
			width: 70,
			height: 32,
		});

		//underline
		// doc
		//   .strokeColor("lightgray")
		//   .lineWidth(2)
		//   .moveTo(
		//     doc.page.margins.left,
		//     places.length > 2 ? doc.y + 41 : doc.y + 54
		//   )
		//   .lineTo(
		//     doc.page.width - doc.page.margins.right - 390,
		//     places.length > 2 ? doc.y + 41 : doc.y + 54
		//   )
		//   .stroke();

		doc
			.font(path.join(fontPath, "SF-Pro-Display-Regular.ttf"))
			.fontSize(9)
			.fillColor("black")
			.fontSize(11)
			.text(
				`Authorized Signatory`,
				doc.page.margins.left + 5,
				places.length > 2 ? doc.y + 50 : doc.y + 55
			);
		//----------------------------------------------------------------

		doc.end();
	} else {
		return res.json({
			status: false,
			message: "Transaction Id Not Found.",
		});
	}
};


exports.completeTransaction = async (req, res) => {
	try {
		const { id } = req.params;
		const { trip_status, additional_kilometers, additional_time } = req.body;

		const validationSchema = Joi.object({
			trip_status: Joi.string().required().messages({
				"string.empty": "Trip Status is required",
				"any.required": "Trip Status is required",
			}),
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

		const data = await Transaction.findByPk(id);
		if (!data) {
			return res.json({
				status: false,
				message: 'Data not found',
			});
		}
		const Trip_data = await Trip.findByPk(data.trip_id);

		Trip_data.trip_status = trip_status;
		Trip_data.additional_kilometers = additional_kilometers;
		Trip_data.additional_time = additional_time;
		await Trip_data.save();

		data.trip_status = trip_status;
		data.additional_kilometers = additional_kilometers;
		data.additional_time = additional_time;
		await data.save();

		res.status(200).json({
			status: true,
			data: data,
			message: "Transaction completed Successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
}
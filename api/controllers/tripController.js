const Joi = require("joi");
const Razorpay = require("razorpay");
const { Op } = require("sequelize");
const {
	Trip,
	Transaction,
	Vehicle,
	otp,
	User,
	Pincode,
	airports,
	localrentalplans,
	DhamCategory,
	DhamPickupCity,
	DhamPackageRoute,
	cities,
} = require("../models");

const razorpayIsProd = process.env.NODE_ENV === "production";
const razorpay = new Razorpay({
	key_id: razorpayIsProd
		? process.env.RAZORPAY_LIVE_KEY_ID
		: process.env.RAZORPAY_TEST_KEY_ID,
	key_secret: razorpayIsProd
		? process.env.RAZORPAY_LIVE_KEY_SECRET
		: process.env.RAZORPAY_TEST_KEY_SECRET,
});

function getTemplateName({ trip_type, car_tab }) {
	if (trip_type === "airport") {
		return "airport_bookings";
	} else if (car_tab === "chardham") {
		return "char_dhar_yatra_bookingss";
	} else if (trip_type === "local") {
		return "local_rentals";
	} else if (["oneWay", "roundTrip"].includes(trip_type)) {
		return "one_way_drop_round_tripssssss";
	} else {
		return null;
	}
}

const dhamCategoryMap = {
	"1 Dham": "One Dham Yatra",
	"2 Dham": "Two Dham Yatra",
	"3 Dham": "Three Dham Yatra",
	"4 Dham": "Four Dham Yatra",
};

function getTemplateBody(template, bookingData) {
	switch (template) {
		case "airport_bookings":
			return {
				1: bookingData.booking_id,
				2: bookingData.full_name,
				3: bookingData.airport_from_to,
				4: bookingData.airport_name,
				5: `${bookingData.places[2]?.label}`,
				6: bookingData.departure_date,
				7: bookingData.vehicle_category,

				8: `Rs ${bookingData.additional_kilometers}/- Per Km`,
				9: bookingData.additional_time_charge || "-",

				10: bookingData.toll_tax ? "Included" : "Not Included",
				11: bookingData.parking_charges ? "Included" : "Not Included",

				12: bookingData.booking_amount,
				13: bookingData.advance_payment,
				14: bookingData.payment_link,
				15: bookingData.contact_number,
			};

		case "local_rentals":
			return {
				1: bookingData.booking_id,
				2: bookingData.full_name,
				3: bookingData.trip_city_name || "-",
				4: bookingData.local_rental_plan_name || "-",
				5: `${bookingData.places[1]?.label}` || "-",
				6: bookingData.departure_date,
				7: bookingData.vehicle_category,

				8: `Rs ${bookingData.additional_kilometers}/- Per Km`,
				9: bookingData.additional_time_charge || "-",

				10: bookingData.toll_tax ? "Included" : "Not Included",
				11: bookingData.parking_charges ? "Included" : "Not Included",

				12: bookingData.advance_payment,
				13: bookingData.booking_amount,
				14: bookingData.payment_link,
				15: bookingData.contact_number,
			};

		case "one_way_drop_round_tripssssss":
			return {
				1: bookingData.booking_id,
				2: bookingData.full_name,

				3: bookingData.departure_date || "-",
				4: bookingData.return_date || "-",

				5: `${bookingData.places[0]?.label}` || "-",
				6: bookingData.trip_type == "oneWay" ? "One Way" : "Round Trip",
				7:
					bookingData.places?.length > 2
						? bookingData.places
							.slice(1, -1)
							.map((place) => place.label)
							.join(" <<< To >>> ")
						: "-",

				8: `${bookingData.places.at(-1)?.label}` || "-",

				9: bookingData.vehicle_category,

				10: `${bookingData.extra_km}`,
				11: `Rs ${bookingData.additional_kilometers}/- Per Km`,

				12: bookingData.toll_tax ? "Included" : "Not Included",

				13: bookingData.advance_payment
					? `Rs ${bookingData.advance_payment}/- `
					: "",
				14: bookingData.booking_amount
					? `Rs ${bookingData.booking_amount}/- `
					: "",

				15: bookingData.payment_link,
				16: bookingData.contact_number,
			};

		case "char_dhar_yatra_bookingss":
			return {
				1: bookingData.booking_id,
				2: bookingData.full_name,
				3: bookingData.departure_date || "-",
				4: bookingData.return_date || "-",
				5: `${bookingData.dham_pickup_city_name}` || "-",
				6:
					dhamCategoryMap[bookingData.dham_category_name] ||
					bookingData.dham_category_name,

				7: `${bookingData.dham_pickup_city_name}` || "-",
				8: bookingData.dham_package_name,

				9: bookingData.dham_package_days + " Days",
				10: bookingData.vehicle_category,
				11: bookingData.booking_amount,
				12: bookingData.advance_payment,
				13: bookingData.payment_link,
				14: bookingData.contact_number,
			};

		default:
			return null;
	}
}

const sendBookingTemplate = async (bookingData) => {
	try {
		const templateName = getTemplateName({
			trip_type: bookingData.trip_type,
			car_tab: bookingData.car_tab,
		});

		const body = getTemplateBody(templateName, bookingData);

		if (!templateName || !body) {
			console.error("Invalid template or body data.");
			return { status: false, message: "Invalid template or body data." };
		}

		Object.keys(body).forEach((key) => {
			body[key] = String(body[key]);
		});

		const payload = {
			phone_number_id: process.env.MYOPERATOR_PHONE_NUMBER_ID,
			customer_country_code: "91",
			customer_number: bookingData.contact_number,
			data: {
				type: "template",
				context: {
					template_name: templateName,
					language: "en",
					body: body,
				},
			},
			reply_to: null,
			myop_ref_id: `TS${String(bookingData.id).padStart(3, "0")}-${bookingData.departure_date}`,
		};

		const response = await fetch(
			"https://publicapi.myoperator.co/chat/messages",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.MYOPERATOR_API_KEY}`,
					"X-MYOP-COMPANY-ID": process.env.MYOPERATOR_COMPANY_ID,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			}
		);

		if (!response.ok) {
			console.error("Failed to send WhatsApp booking template:", await response.text());
			return { status: false, message: "Failed to send booking template" };
		}

		return {
			status: true,
			message: "Booking sent successfully!",
		};
	} catch (error) {
		console.error("Error sending booking template:", error);
		return { status: false, message: "Internal error occurred" };
	}
};

exports.createTrip = async (req, res) => {
	try {
		let {
			vehicle_id,
			pickup_address,
			extra_km,
			toll_tax,
			parking_charges,
			driver_charges,
			night_charges,
			fuel_charges,
			user_id,
			places,
			departure_date,
			return_date,
			distance,
			trip_type,
			trip_status,
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
			pincode,
			original_amount,
			paid_amount,
		} = req.body;

		if (req.user?.role === "customer") {
			user_id = req.user.id;
		}
		if (!user_id) {
			return res.status(401).json({
				status: false,
				message: "Unauthorized: user could not be resolved for this booking.",
			});
		}
		const Schema = Joi.object({
			vehicle_id: Joi.string().required().messages({
				"string.empty": "Vehicle id is required",
				"any.required": "Vehicle id is required",
			}),
			user_id: Joi.string().required().messages({
				"string.empty": "User id is required",
				"any.required": "User id is required",
			}),
			places: Joi.array()
				.required()
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
			airport_id: Joi.alternatives().conditional("trip_type", {
				is: "airport",
				then: Joi.number().required().messages({
					"any.required": "Airport is required.",
					"number.base": "Airport ID must be a valid number.",
				}),
				otherwise: Joi.number().optional().allow(null).messages({
					"number.base": "Airport ID must be a valid number.",
				}),
			}),
			airport_city_id: Joi.alternatives().conditional("trip_type", {
				is: "airport",
				then: Joi.number().required().messages({
					"any.required": "Please select a city",
					"number.base": "city must be a valid number",
				}),
				otherwise: Joi.number().optional().allow(null).messages({
					"number.base": "city must be a valid number",
				}),
			}),
			airport_from_to: Joi.alternatives().conditional("trip_type", {
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
		}).unknown(true);

		const { error } = Schema.validate(req.body, { abortEarly: false });
		if (error) {
			return res.json({
				status: false,
				message: error?.details[0]?.message,
			});
		}

		const data = await Trip.create({
			vehicle_id,
			pickup_address,
			extra_km,
			toll_tax,
			parking_charges,
			driver_charges,
			night_charges,
			fuel_charges,
			user_id,
			places,
			departure_date,
			return_date,
			distance,
			trip_type,
			trip_status,
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
			pincode: pincode ? pincode : null,
		});

		const plainData = data.get({ plain: true });

		const trips = await Trip.findOne({
			where: { id: plainData.id },
			include: [
				{
					model: User,
					as: "users",
				},
				{
					model: Vehicle,
				},
				{
					model: Pincode,
					as: "pincode_details",
				},
				{
					model: airports,
					as: "airport_detail",
				},
				{
					model: cities,
					as: "trip_city",
				},
				{
					model: localrentalplans,
					as: "local_rental_plan",
				},
				{
					model: DhamPackageRoute,
					as: "dham_package",
				},
				{
					model: DhamPickupCity,
					as: "dham_pickup_city",
				},
				{
					model: DhamCategory,
					as: "dham_category",
				},
			],
		});
		const tripsData = trips.get({ plain: true });

		const bookingData = {
			trip_type: plainData.trip_type,
			booking_id: `TS${plainData.id.toString().padStart(3, "0")}`,
			full_name: tripsData.users?.name,
			airport_from_to: airport_from_to,
			airport_name: tripsData.airport_detail?.name || "",
			pickup_address: pickup_address,
			departure_date: `[${new Date(departure_date).toLocaleString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})} Time ${new Date(departure_date).toLocaleString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			})}]`,
			return_date: return_date
				? `[${new Date(return_date).toLocaleString("en-GB", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				})} Time ${new Date(return_date).toLocaleString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				})}]`
				: " - ",
			vehicle_category: tripsData.Vehicle.title,
			extra_km: distance,
			additional_kilometers: extra_km,
			driver_charges: driver_charges,
			night_charges: night_charges,
			toll_tax: toll_tax,
			parking_charges: parking_charges,
			booking_amount: original_amount,
			advance_payment: paid_amount,
			contact_number: tripsData.users?.phone_number,

			places: places,
			city_id,
			local_rental_plan_id,
			car_tab,
			dham_package_name,
			dham_pickup_city_name,
			dham_package_id,
			dham_pickup_city_id,
			dham_package_days,
			dham_category_id,
			dham_category_name,

			trip_city_name: tripsData.trip_city?.name,
			local_rental_plan_name:
				tripsData.local_rental_plan?.hours +
				" Hours, " +
				tripsData.local_rental_plan?.km +
				" Km",
			additional_time_charge: `Rs ${tripsData.additional_time_charge || 0
				}/- Per Hours`,
			payment_link: "",
		};

		const advancePercentage = bookingData.car_tab === "chardham" ? 0.1 : 0.2;

		const driverAdvanceAmount = Math.round(
			original_amount * advancePercentage * 100
		);

		const paymentLinkOptions = {
			amount: driverAdvanceAmount,
			currency: "INR",
			description: `Advance Payment for Booking ID: ${bookingData.booking_id}`,
			reference_id: bookingData.booking_id,
			customer: {
				name: bookingData.full_name,
				contact: bookingData.contact_number,
			},
			notify: {
				sms: false,
				email: false,
			},
		};

		try {
			const link = await razorpay.paymentLink.create(paymentLinkOptions);
			bookingData.payment_link = link.short_url;
			await sendBookingTemplate(bookingData);
		} catch (error) {
			if (error?.error) {
				console.error("Razorpay error while creating payment link:", error.error.description);
			} else {
				console.error("Failed to create payment link or send booking template:", error);
			}
		}

		res.status(200).json({
			status: true,
			data: data,
			tripId: plainData.id,
			message: "Trip Created Successfully",
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
		const data = await Trip.findOne({
			where: { id: id },
			include: [
				{
					model: Transaction,
					where: { trip_id: id },
					required: false,
				},
				{
					model: User,
					as: "users",
				},
				{
					model: Vehicle,
				},
				{
					model: Pincode,
					as: "pincode_details",
				},
				{
					model: airports,
					as: "airport_detail",
				},
				{
					model: cities,
					as: "trip_city",
				},
				{
					model: localrentalplans,
					as: "local_rental_plan",
				},
				{
					model: DhamPackageRoute,
					as: "dham_package",
				},
				{
					model: DhamPickupCity,
					as: "dham_pickup_city",
				},
				{
					model: DhamCategory,
					as: "dham_category",
				},
			],
		});

		if (data) {
			res.status(200).json({
				status: true,
				data: data,
				message: "Transaction Details Fetched",
			});
		} else {
			res.status(404).json({
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

exports.getAllTrips = async (req, res) => {
	try {
		const {
			page = 1,
			items_per_page = 10,
			search = "",
			userId,
			tripStatus,
		} = req.query;
		const pageNumber = parseInt(page, 10);
		const itemsPerPage = parseInt(items_per_page, 10);

		const whereCondition = {
			...(search && {
				[Op.or]: [{ invoice_id: { [Op.like]: `%${search}%` } }],
			}),

			...(userId && {
				user_id: userId,
			}),

			...(tripStatus && {
				trip_status: tripStatus,
			}),
		};

		// full details: Trip + full User + full Vehicle + full Transactions
		// + all lookup tables (pincode, airport, city, local rental plan, dham)
		const { count, rows: trips } = await Trip.findAndCountAll({
			where: whereCondition,
			include: [
				{
					model: Transaction, // ALL fields, no attributes filter
					required: false,
				},
				{
					model: User,
					as: "users", // full user record (id, name, phone_number, etc.)
				},
				{
					model: Vehicle, // full vehicle record
				},
				{
					model: Pincode,
					as: "pincode_details",
				},
				{
					model: airports,
					as: "airport_detail",
				},
				{
					model: cities,
					as: "trip_city",
				},
				{
					model: localrentalplans,
					as: "local_rental_plan",
				},
				{
					model: DhamPackageRoute,
					as: "dham_package",
				},
				{
					model: DhamPickupCity,
					as: "dham_pickup_city",
				},
				{
					model: DhamCategory,
					as: "dham_category",
				},
			],
			offset: (pageNumber - 1) * itemsPerPage,
			limit: itemsPerPage,
			order: [["createdAt", "DESC"]],
			distinct: true, // correct count when joining hasMany (Transaction)
		});

		const totalPages = Math.ceil(count / itemsPerPage);
		const from = (pageNumber - 1) * itemsPerPage + 1;
		const to = Math.min(pageNumber * itemsPerPage, count);

		const tripsWithIndex = trips.map((trip, index) => ({
			...trip.toJSON(),
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
			data: tripsWithIndex,
			payload: {
				pagination: pagination,
			},
			message: "Trip fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching trips:", error);
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};


const ALLOWED_TRANSITIONS = {
	reserved: ["ongoing", "cancelled"],
	ongoing: ["completed", "cancelled"],
	completed: [],
	cancelled: [],
};

exports.markConverted = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOne({
      where: { id },
    });

    if (!trip) {
      return res.status(404).json({
        status: false,
        message: "Trip not found",
      });
    }

    if (trip.is_converted_post) {
      return res.status(400).json({
        status: false,
        message: "Trip is already converted.",
      });
    }

    trip.is_converted_post = true;
    await trip.save();

    return res.status(200).json({
      status: true,
      message: "Trip marked as converted successfully.",
      data: trip,
    });
  } catch (error) {
    console.error("markConverted Error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.markUnConverted = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOne({
      where: { id },
    });

    if (!trip) {
      return res.status(404).json({
        status: false,
        message: "Trip not found",
      });
    }

    if (!trip.is_converted_post) {
      return res.status(400).json({
        status: false,
        message: "Trip is already unconverted.",
      });
    }

    trip.is_converted_post = false;
    await trip.save();

    return res.status(200).json({
      status: true,
      message: "Trip marked as unconverted successfully.",
      data: trip,
    });
  } catch (error) {
    console.error("markUnConverted Error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
exports.cancelTrip = async (req, res) => {
	try {
		const { id } = req.params;
		const { reason } = req.body || {};

		const trip = await Trip.findOne({ where: { id } });
		if (!trip) {
			return res.status(404).json({ status: false, message: "Trip not found" });
		}

		const current = trip.trip_status;
		if (!ALLOWED_TRANSITIONS[current]?.includes("cancelled")) {
			return res.status(400).json({
				status: false,
				message: `Trip cannot be cancelled from status "${current}"`,
			});
		}

		trip.trip_status = "cancelled";
		if (reason) trip.cancellation_reason = reason;
		await trip.save();

		return res.status(200).json({
			status: true,
			data: trip,
			message: "Trip cancelled successfully",
		});
	} catch (error) {
		console.error("Error cancelling trip:", error);
		return res.status(500).json({ status: false, message: error.message });
	}
};

const VALID_STATUSES = ["reserved", "ongoing", "completed", "cancelled"];


exports.changeTripStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, reason } = req.body || {};

		if (!status || !VALID_STATUSES.includes(status)) {
			return res.status(400).json({
				status: false,
				message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
			});
		}

		const trip = await Trip.findOne({ where: { id } });
		if (!trip) {
			return res.status(404).json({ status: false, message: "Trip not found" });
		}

		const current = trip.trip_status;

		if (current === status) {
			return res.status(400).json({
				status: false,
				message: `Trip is already in "${status}" status`,
			});
		}

		if (!ALLOWED_TRANSITIONS[current]?.includes(status)) {
			return res.status(400).json({
				status: false,
				message: `Cannot change status from "${current}" to "${status}"`,
			});
		}

		trip.trip_status = status;
		if (reason) trip.cancellation_reason = reason;
		await trip.save();

		return res.status(200).json({
			status: true,
			data: trip,
			message: `Trip status updated to "${status}"`,
		});
	} catch (error) {
		console.error("Error changing trip status:", error);
		return res.status(500).json({ status: false, message: error.message });
	}
};

exports.completeTrip = async (req, res) => {
	try {
		const { id } = req.params;

		const trip = await Trip.findOne({ where: { id } });
		if (!trip) {
			return res.status(404).json({ status: false, message: "Trip not found" });
		}

		const current = trip.trip_status;
		if (!ALLOWED_TRANSITIONS[current]?.includes("completed")) {
			return res.status(400).json({
				status: false,
				message: `Trip cannot be marked completed from status "${current}"`,
			});
		}

		trip.trip_status = "completed";
		await trip.save();

		return res.status(200).json({
			status: true,
			data: trip,
			message: "Trip marked as completed",
		});
	} catch (error) {
		console.error("Error completing trip:", error);
		return res.status(500).json({ status: false, message: error.message });
	}
};
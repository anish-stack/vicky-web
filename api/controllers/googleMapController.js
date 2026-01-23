// import fetch from "node-fetch";
const { Pincode } = require("../models");

exports.autocompletecity = async (req, res) => {
	try {
		const { query, city } = req.query;

		if (!query) {
			return res.status(400).json({
				error: "Missing required query parameter: query.",
			});
		}

		const googleMapApiKey = process.env.GOOGLE_MAPS_API_KEY;

		const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
			query
		)}&key=${googleMapApiKey}&components=country:in${
			city == 1 ? "&types=(cities)" : ""
		}`;

		const response = await fetch(googleMapsApiUrl);

		if (!response.ok) {
			throw new Error(`Google Maps API error: ${response.statusText}`);
		}

		const data = await response.json();
		res.status(200).json(data);
	} catch (error) {
		console.error("Error fetching Google Maps Places data:", error.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

exports.autocomplete = async (req, res) => {
	try {
		const { query, city } = req.query;

		if (!query) {
			return res.status(400).json({
				error: "Missing required query parameter: query.",
			});
		}

		const googleMapApiKey = process.env.GOOGLE_MAPS_API_KEY;

		// const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
		// 	query
		// )}&key=${googleMapApiKey}&components=country:in${
		// 	city == 1 ? "&types=(cities)" : ""
		// }`;
		// Constructing Google Maps Autocomplete URL with components (country:in) and types=postal_code
		const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
			query
			// )}&key=${googleMapApiKey}&components=country:in&types=premise`;
		)}&key=${googleMapApiKey}&components=country:in&types=establishment`;

		const response = await fetch(googleMapsApiUrl);

		if (!response.ok) {
			throw new Error(`Google Maps API error: ${response.statusText}`);
		}

		const data = await response.json();
		res.status(200).json(data);
	} catch (error) {
		console.error("Error fetching Google Maps Places data:", error.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

exports.getLocalityPlaceId = async (req, res) => {
	try {
		const { place_id } = req.query;

		if (!place_id) {
			return res.status(400).json({
				status: false,
				message: "Missing required query parameter: place_id.",
			});
		}

		const googleMapApiKey = process.env.GOOGLE_MAPS_API_KEY;

		const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${googleMapApiKey}`;
		const placeDetailsResponse = await fetch(placeDetailsUrl);

		if (!placeDetailsResponse.ok) {
			throw new Error(
				`Google Maps API error: ${placeDetailsResponse.statusText}`
			);
		}

		const placeDetailsData = await placeDetailsResponse.json();

		if (
			!placeDetailsData.result ||
			!placeDetailsData.result.address_components
		) {
			return res.status(404).json({ error: "Place details not found." });
		}

		const localityComponent = placeDetailsData.result.address_components.find(
			(component) => component.types.includes("locality")
		);

		if (!localityComponent) {
			return res
				.status(404)
				.json({ error: "Locality not found in place details." });
		}

		const localityName = localityComponent?.long_name;

		const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
			localityName
		)}&key=${googleMapApiKey}&components=country:in&types=(cities)`;

		const autocompleteResponse = await fetch(autocompleteUrl);

		if (!autocompleteResponse.ok) {
			throw new Error(
				`Google Maps API error: ${autocompleteResponse.statusText}`
			);
		}

		const autocompleteData = await autocompleteResponse.json();

		if (!autocompleteData.predictions.length) {
			return res.status(404).json({ error: "Locality place_id not found." });
		}

		const localityPlaceId = autocompleteData.predictions[0].place_id;

		res.status(200).json({
			status: true,
			data: {
				locality: localityName,
				locality_place_id: localityPlaceId,
			},
		});
	} catch (error) {
		console.error("Error fetching locality place_id:", error.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

exports.distancematrix = async (req, res) => {
	try {
		const { origins, destinations } = req.query;

		if (!origins || !destinations) {
			return res.status(400).json({
				error: "Missing required origins and destinations.",
			});
		}

		const googleMapApiKey = process.env.GOOGLE_MAPS_API_KEY;

		const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=driving&key=${googleMapApiKey}`;

		const response = await fetch(googleMapsApiUrl);

		if (!response.ok) {
			throw new Error(`Google Maps API error: ${response.statusText}`);
		}

		const data = await response.json();
		res.status(200).json(data);
	} catch (error) {
		console.error("Error fetching Google Maps Places data:", error);
		res.status(500).json({ error: "Internal server error." });
	}
};
exports.getPincodeFromPlaceId = async (req, res) => {
	try {
		const { place_id } = req.query;

		if (!place_id) {
			return res.status(400).json({ error: "Missing place_id" });
		}

		const googleMapApiKey = process.env.GOOGLE_MAPS_API_KEY;

		// Step 1: Place Details API
		const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${googleMapApiKey}`;
		const placeDetailsResponse = await fetch(placeDetailsUrl);
		const placeDetailsData = await placeDetailsResponse.json();

		// Check for a valid response
		if (placeDetailsData.status !== "OK" || !placeDetailsData.result) {
			return res.status(200).json({
				status: false,
				error:
					"Invalid place_id or failed to fetch place details from Google API",
			});
		}

		const postalCodeComponent = placeDetailsData.result.address_components.find(
			(comp) => comp.types.includes("postal_code")
		);

		let pincode = null;
		let source = null;

		if (postalCodeComponent) {
			pincode = postalCodeComponent.long_name;
			source = "place_details";
		} else {
			// Step 2: Fallback to Geocoding API
			const { lat, lng } = placeDetailsData.result.geometry.location;
			const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapApiKey}`;
			const geocodeResponse = await fetch(geocodeUrl);
			const geocodeData = await geocodeResponse.json();

			const geocodePostalComponent = geocodeData.results
				.flatMap((r) => r.address_components)
				.find((comp) => comp.types.includes("postal_code"));

			if (geocodePostalComponent) {
				pincode = geocodePostalComponent.long_name;
				source = "geocode";
			}
		}

		// Step 3: Check pincode in your DB
		if (pincode) {
			const exists = await Pincode.findOne({ where: { pincode } }); // Sequelize example
			// const exists = await Pincode.findOne({ pincode }); // MongoDB/Mongoose example

			if (exists) {
				return res.status(200).json({
					status: true,
					data: {
						place_id,
						pincode,
						source,
						message: "Service available in this area",
					},
				});
			} else {
				return res.status(200).json({
					status: false,
					data: {
						place_id,
						pincode,
						source,
						message: "Service not available in this area",
					},
				});
			}
		}

		// No pincode found at all
		return res.status(404).json({
			status: false,
			error: "Pincode not found via Place Details or Geocoding API",
		});
	} catch (error) {
		console.error("Error checking pincode:", error);
		return res
			.status(500)
			.json({ status: false, error: "Internal server error" });
	}
};

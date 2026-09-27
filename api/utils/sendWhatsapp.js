require("dotenv").config();
const axios = require("axios");

const MYOPERATOR_API_KEY = process.env.MYOPERATOR_API_KEY;
const MYOPERATOR_COMPANY_ID = process.env.MYOPERATOR_COMPANY_ID;
const MYOPERATOR_PHONE_NUMBER_ID = process.env.MYOPERATOR_PHONE_NUMBER_ID;
const MYOPERATOR_API = "https://publicapi.myoperator.co/chat/messages";

function getTemplateBody(templateName, data = {}) {
    switch (templateName) {
        case "tour_package_book":
            return {
                1: String(data.name || data.Name || "Customer"),
                2: String(data.booking_ref || data.bookingRef || data.BookingId || "NA"),
                3: String(data.tour_title || data.tourTitle || data.Tour || "NA"),
                4: String(data.pickup_address || data.pickupAddress || "NA"),
                5: String(data.pickup_time || data.pickupTime || "NA"),
                6: String(data.vehicle_label || data.vehicleLabel || data.vehicle || "NA"),
                7: String(data.total_amount ?? data.totalAmount ?? 0),
                8: String(data.advance_amount ?? data.advanceAmount ?? 0),
                9: String(data.balance_amount ?? data.balanceAmount ?? 0)
            };
        case "tour_package_driver":
            return {
                1: String(data.name || "Customer"),
                2: String(data.booking_ref || "NA"),
                3: String(data.driver_name || "NA"),
                4: String(data.driver_mobile || "NA"),
                5: String(data.vehicle_number || "NA"),
                6: String(data.vehicle_label || "NA"),
            };
        default:
            return null;
    }
}

exports.sendWhatsappTemplate = async (data) => {
    try {
        const templateName = data.templateName;
        const body = getTemplateBody(templateName, data);
        if (!body) throw new Error(`Invalid or unknown template: ${templateName}`);
        const context = { template_name: templateName, language: "en", body };
        const payload = {
            phone_number_id: MYOPERATOR_PHONE_NUMBER_ID,
            customer_country_code: "91",
            customer_number: String(data.number).replace(/\D/g, "").slice(-10),
            data: { type: "template", context },
            reply_to: null,
            myop_ref_id: data.id ? `TS${String(data.id).padStart(3, "0")}` : null
        };
        const response = await axios.post(MYOPERATOR_API, payload, {
            headers: {
                Authorization: `Bearer ${MYOPERATOR_API_KEY}`,
                "X-MYOP-COMPANY-ID": MYOPERATOR_COMPANY_ID,
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            timeout: 10000
        });
        return response.data;
    } catch (err) {
        console.error("WhatsApp Send Error:", err.response?.data || err.message);
        if (err.response?.data?.errors) console.error("Detailed Errors:", err.response.data.errors);
        return null;
    }
};

exports.sendTourPackageBooking = (phone, booking) => exports.sendWhatsappTemplate({
    templateName: "tour_package_book",
    number: phone || booking?.mobile,
    id: booking?.id,
    name: booking?.name,
    booking_ref: booking?.booking_ref,
    tour_title: booking?.tour_title,
    pickup_address: booking?.pickup_address,
    pickup_time: booking?.pickup_date && booking?.pickup_time
        ? `${booking.pickup_date} at ${booking.pickup_time}`
        : booking?.pickup_date || booking?.pickup_time || "NA", vehicle_label: booking?.vehicle_label,
    total_amount: booking?.total_amount,
    advance_amount: booking?.advance_amount,
    balance_amount: booking?.balance_amount
});

exports.sendTourPackageDriver = (
    phone,
    booking,
    driver = {}
) =>
    exports.sendWhatsappTemplate({
        templateName: "tour_package_driver",
        number: phone || booking?.mobile,
        id: booking?.id,

        name: booking?.name,
        booking_ref: booking?.booking_ref,

        driver_name:
            driver?.driver_name ||
            driver?.name ||
            "NA",

        driver_mobile:
            driver?.driver_mobile ||
            driver?.mobile ||
            "NA",

        vehicle_number:
            driver?.vehicle_number ||
            driver?.vehicleNumber ||
            "NA",

        vehicle_label:
            driver?.vehicle_label ||
            driver?.vehicle_name ||
            driver?.vehicle ||
            booking?.vehicle_label ||
            "NA",
    });
require("dotenv").config();

const axios = require("axios");

const MYOPERATOR_API_KEY = process.env.MYOPERATOR_API_KEY;
const MYOPERATOR_COMPANY_ID = process.env.MYOPERATOR_COMPANY_ID;
const MYOPERATOR_PHONE_NUMBER_ID = process.env.MYOPERATOR_PHONE_NUMBER_ID;
const MYOPERATOR_API = process.env.MYOPERATOR_API_ENDPOINT;

function cleanPhone(number) {
    if (!number) return null;

    const cleaned = String(number).replace(/\D/g, "").slice(-10);

    if (cleaned.length !== 10) return null;

    return cleaned;
}

function getTemplateBody(templateName, data = {}) {
    switch (templateName) {
        case "registration_complete_verification_start":
            return {
                1: String(data.name)
            };

        case "copy_payment_init":
            return {
                1: String(data.name),
                2: String(data.paymentLink)
            };

        case "payment_success_profile_live":
            return {
                1: String(data.name)
            };

        case "tour_guide":
            return {
                1: String(data.name),
                2: String(data.number),
                3: String(data.security_deposit)
            };

        case "canceltourguidebookingrequest":
            return {
                1: String(data.tour_guide_name),
                2: String(data.driver_name),
                3: String(data.number),
                4: String(data.bookingId)
            };

        case "copy_provider_msg":
            return {
                1: String(data.providerName),
                2: String(data.driverName),
                3: String(data.driverNumber),
                4: String(data.message)
            };

        // ---- Tour guide security deposit payment (dedicated templates) ----

        case "tour_guide_security_deposit_link":
            return {
                1: String(data.name),
                2: String(data.security_deposit),
                3: String(data.paymentLink)
                // 4th placeholder for "valid for 1 hour" is baked into the
                // template text itself in WhatsApp Business Manager, not passed here.
            };

        case "tour_guide_security_deposit_success":
            return {
                1: String(data.name),
                2: String(data.security_deposit),
                3: String(data.bookingId)
            };

        case "tour_guide_security_deposit_expired":
            return {
                1: String(data.name),
                2: String(data.bookingId)
            };
        case "rto_agent_send_request":
            return {
                1: String(data.name),
                2: String(data.guestName),
                3: String(data.guestPhone),
                4: String(data.source),
            };



        default:
            return null;
    }
}

/**
 * `data.customerNumber` is the ONLY source used to decide WHO the WhatsApp
 * message is sent to (recipient). Any other number-like field is business
 * data that may appear inside the template body only.
 */
exports.sendWhatsappTemplateForContactForm = async (data) => {
    try {
        console.log("📩 Incoming WhatsApp Request:", data);

        const templateName = data.templateName;
        const body = getTemplateBody(templateName, data);

        if (!body) {
            throw new Error(`Invalid template: ${templateName}`);
        }

        const cleanNumber = cleanPhone(data.customerNumber);

        if (!cleanNumber) {
            throw new Error(`Invalid customer/recipient number: ${data.customerNumber}`);
        }

        const context = {
            template_name: templateName,
            language: "en",
            body
        };

        const payload = {
            phone_number_id: MYOPERATOR_PHONE_NUMBER_ID,
            customer_country_code: "91",
            customer_number: cleanNumber,
            data: {
                type: "template",
                context
            },
            reply_to: null,
            myop_ref_id: data.id
                ? `TS${String(data.id).padStart(3, "0")}`
                : null
        };

        console.log(
            "🚀 MyOperator Payload:",
            JSON.stringify(payload, null, 2)
        );

        const response = await axios.post(
            MYOPERATOR_API,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${MYOPERATOR_API_KEY}`,
                    "X-MYOP-COMPANY-ID": MYOPERATOR_COMPANY_ID,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                timeout: 10000
            }
        );

        console.log("✅ WhatsApp API Response:", response.data);

        return response.data;
    } catch (err) {
        console.error("❌ WhatsApp Send Error:");

        if (err.response) {
            console.error("API Error:", err.response.data);
        } else {
            console.error(err.message);
        }

        return null;
    }
};

// ---- helpers ----
// Every helper takes an explicit recipient phone (customerNumber), separate
// from any "number" that only needs to show up inside the template body.

exports.sendRegistrationSuccess = (customerNumber, name, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "registration_complete_verification_start",
        customerNumber,
        name,
        id: userId
    });

exports.sendPaymentLink = (customerNumber, name, paymentLink, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "copy_payment_init",
        customerNumber,
        name,
        paymentLink,
        id: userId
    });

exports.sendPaymentSuccess = (customerNumber, name, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "payment_success_profile_live",
        customerNumber,
        name,
        id: userId
    });

exports.sendTourGuideRequest = (customerNumber, name, number, security_deposit, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "tour_guide",
        customerNumber,
        name,
        number,
        security_deposit,
        id: userId
    });

exports.sendCancelTourGuideBookingRequest = (
    customerNumber,
    tour_guide_name,
    driver_name,
    number,
    bookingId,
    userId
) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "canceltourguidebookingrequest",
        customerNumber,
        tour_guide_name,
        driver_name,
        number,
        bookingId,
        id: userId
    });

exports.sendContactFormProvider = async (
    customerNumber,
    providerName,
    driverName,
    driverNumber,
    message,
    driverId
) => {
    console.log("📞 sendContactFormProvider called with:", {
        customerNumber,
        providerName,
        driverName,
        driverNumber,
        message,
        driverId
    });

    return exports.sendWhatsappTemplateForContactForm({
        templateName: "copy_provider_msg",
        customerNumber,
        providerName,
        driverName,
        driverNumber,
        message,
        id: driverId
    });
};

// ---- Tour guide security deposit payment (dedicated) ----

exports.sendTourGuideSecurityDepositLink = (customerNumber, name, security_deposit, paymentLink, bookingId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "tour_guide_security_deposit_link",
        customerNumber,
        name,
        security_deposit,
        paymentLink,
        id: bookingId
    });

exports.sendTourGuideSecurityDepositSuccess = (customerNumber, name, security_deposit, bookingId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "tour_guide_security_deposit_success",
        customerNumber,
        name,
        security_deposit,
        bookingId,
        id: bookingId
    });

exports.sendTourGuideSecurityDepositExpired = (customerNumber, name, bookingId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "tour_guide_security_deposit_expired",
        customerNumber,
        name,
        bookingId,
        id: bookingId
    });


    exports.sendRtoRequest = (customerNumber, name, guestName,guestPhone, source) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "rto_agent_send_request",
        customerNumber,
        name,
        guestName,
        guestPhone,
        source
    });
         
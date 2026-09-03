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

        case "copy_provider_msg":
            return {
                1: String(data.providerName),
                2: String(data.driverName),
                3: String(data.driverNumber),
                4: String(data.message)
            };

        default:
            return null;
    }
}

exports.sendWhatsappTemplateForContactForm = async (data) => {
    try {
        console.log("📩 Incoming WhatsApp Request:", data);

        const templateName = data.templateName;
        const body = getTemplateBody(templateName, data);

        if (!body) {
            throw new Error(`Invalid template: ${templateName}`);
        }

        const cleanNumber = cleanPhone(data.number);

        if (!cleanNumber) {
            throw new Error(`Invalid phone number: ${data.number}`);
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

exports.sendRegistrationSuccess = (phone, name, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "registration_complete_verification_start",
        number: phone,
        name,
        id: userId
    });

exports.sendPaymentLink = (phone, name, paymentLink, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "copy_payment_init",
        number: phone,
        name,
        paymentLink,
        id: userId
    });

exports.sendPaymentSuccess = (phone, name, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "payment_success_profile_live",
        number: phone,
        name,
        id: userId
    });

exports.sendTourGuideRequest = (name, number, security_deposit, userId) =>
    exports.sendWhatsappTemplateForContactForm({
        templateName: "tour_guide",
        number,
        name,
        security_deposit,
        id: userId
    });

exports.sendContactFormProvider = async (
    providerName,
    driverName,
    driverNumber,
    message,
    driverId
) => {
    console.log("📞 sendContactFormProvider called with:", {
        providerName,
        driverName,
        driverNumber,
        message,
        driverId
    });

    return exports.sendWhatsappTemplateForContactForm({
        templateName: "copy_provider_msg",
        number: driverNumber,
        providerName,
        driverName,
        driverNumber,
        message,
        id: driverId
    });
};
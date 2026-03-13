require("dotenv").config();
const axios = require("axios");

const MYOPERATOR_API_KEY = process.env.MYOPERATOR_API_KEY;
const MYOPERATOR_COMPANY_ID = process.env.MYOPERATOR_COMPANY_ID;
const MYOPERATOR_PHONE_NUMBER_ID = process.env.MYOPERATOR_PHONE_NUMBER_ID;
const MYOPERATOR_API = process.env.MYOPERATOR_API_ENDPOINT;

// ─── Template body builders ───────────────────────────────────────────────────
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

        default:
            return null;
    }
}

exports.sendWhatsappTemplateForContactForm = async (data) => {
    try {

        const templateName = data.templateName;
        const body = getTemplateBody(templateName, data);

        if (!body) throw new Error(`Invalid or unknown template: ${templateName}`);

        const context = {
            template_name: templateName,
            language: "en",
            body
        };

        /* ===============================
           BUTTON SUPPORT (PAYMENT LINK)
        =============================== */

      

        const payload = {
            phone_number_id: MYOPERATOR_PHONE_NUMBER_ID,
            customer_country_code: "91",
            customer_number: String(data.number),
            data: {
                type: "template",
                context
            },
            reply_to: null,
            myop_ref_id: data.id
                ? `TS${String(data.id).padStart(3, "0")}`
                : null
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

        if (err.response?.data?.errors) {
            console.error("Detailed Errors:", err.response.data.errors);
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


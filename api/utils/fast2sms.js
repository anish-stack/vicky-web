require("dotenv").config();
const axios = require("axios");

/**
 * Fast2SMS WhatsApp sender - used ONLY for Tour Package messages
 * (customer confirmation, admin alert, driver details) so they leave from the
 * company WhatsApp number, separate from MyOperator (login OTP, insurance,
 * booking, fraud complaint ...).
 *
 * ENV
 *   FAST2SMS_API_KEY                 dashboard -> Dev API -> authorization key
 *   FAST2SMS_WA_PHONE_NUMBER_ID      WhatsApp phone number id (company number)
 *   FAST2SMS_WA_TPL_TOUR_CUSTOMER    approved template/message id - customer booking confirmation
 *   FAST2SMS_WA_TPL_TOUR_ADMIN       approved template/message id - admin booking alert
 *   FAST2SMS_WA_TPL_TOUR_DRIVER      approved template/message id - driver details to customer
 *   TOUR_ADMIN_WHATSAPP              admin number(s), comma separated, 10 digit
 *   FAST2SMS_WA_URL                  optional, default https://www.fast2sms.com/dev/whatsapp
 *
 * Variables are sent pipe separated (v1|v2|...) in template order.
 */

const URL = process.env.FAST2SMS_WA_URL || "https://www.fast2sms.com/dev/whatsapp";

const clean = (v, fallback = "NA") => {
    const s = String(v ?? "").replace(/[|\r\n]+/g, " ").trim();
    return s || fallback;
};

const tenDigits = (v) => String(v || "").replace(/\D/g, "").slice(-10);

exports.isConfigured = (templateEnvKey) =>
    Boolean(
        process.env.FAST2SMS_API_KEY &&
        process.env.FAST2SMS_WA_PHONE_NUMBER_ID &&
        process.env[templateEnvKey]
    );

/**
 * @param {object} o
 * @param {string|string[]} o.numbers   10 digit number(s)
 * @param {string} o.templateEnvKey     name of the env var holding the template id
 * @param {Array}  o.variables          template variables in order
 * @returns {Promise<object|null>}      provider response, null when not sent
 */
exports.sendWhatsApp = async ({ numbers, templateEnvKey, variables = [] }) => {
    try {
        if (!exports.isConfigured(templateEnvKey)) {
            console.error(`Fast2SMS WhatsApp not configured (${templateEnvKey}) - message skipped`);
            return null;
        }

        const list = (Array.isArray(numbers) ? numbers : String(numbers || "").split(","))
            .map(tenDigits)
            .filter((n) => /^[6-9]\d{9}$/.test(n));

        if (!list.length) {
            console.error("Fast2SMS WhatsApp: no valid mobile number");
            return null;
        }

        const res = await axios.get(URL, {
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                message_id: process.env[templateEnvKey],
                phone_number_id: process.env.FAST2SMS_WA_PHONE_NUMBER_ID,
                numbers: list.join(","),
                variables_values: variables.map((v) => clean(v)).join("|"),
            },
            timeout: 10000,
        });

        if (res.data && res.data.return === false) {
            console.error("Fast2SMS WhatsApp rejected:", res.data);
            return null;
        }

        return res.data;
    } catch (err) {
        console.error("Fast2SMS WhatsApp error:", err.response?.data || err.message);
        return null;
    }
};

exports.adminNumbers = () =>
    String(process.env.TOUR_ADMIN_WHATSAPP || "")
        .split(",")
        .map(tenDigits)
        .filter((n) => /^[6-9]\d{9}$/.test(n));

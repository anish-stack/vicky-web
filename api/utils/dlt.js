const axios = require("axios");

const sendDltMessage = async (phone, otp) => {
  try {
    /* -------------------- Validation -------------------- */
    if (!phone) {
      throw new Error("Please provide a valid mobile number");
    }

    phone = phone.toString().trim();
    if (phone.startsWith("+91")) {
      phone = phone.slice(3);
    }

    // Indian mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(phone)) {
      throw new Error("Invalid Indian mobile number");
    }

    otp = otp.toString().trim();
    if (!otp || isNaN(otp)) {
      throw new Error("Please provide a valid numeric OTP");
    }

    /* -------------------- MyOperator Config -------------------- */
    const url = "https://publicapi.myoperator.co/chat/messages";

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MYOPERATOR_API_KEY}`,
      "X-MYOP-COMPANY-ID": process.env.MYOPERATOR_COMPANY_ID,
    };

    const body = {
      phone_number_id: process.env.MYOPERATOR_PHONE_NUMBER_ID,
      customer_country_code: "91",
      customer_number: phone,
      type: "template",
      data: {
        type: "template",
        context: {
          template_name: "login_otp",
          language: "en",
          category: "authentication",
          body: {
            otp: otp
          },
          buttons: [
            {
              index: 0,
              otp: otp
            }
          ]
        }
      }
    };

    /* -------------------- API Call -------------------- */
    const response = await axios.post(url, body, { headers });

    console.log("✅ WhatsApp OTP sent via MyOperator:", otp);
    return response.data;

  } catch (error) {
    console.error(
      "❌ Error sending WhatsApp OTP (MyOperator):",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendDltMessage;

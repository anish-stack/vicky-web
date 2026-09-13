// utils/aadhaarKyc.js

const axios = require("axios");

const QUICKEKYC_BASE_URL =
  "https://api.quickekyc.com/api/v1/aadhaar-v2";

const API_KEY = process.env.QUICKEKYC_API_KEY;
const TIMEOUT = 20000;

async function sendAadhaarOtp(aadhaarNumber) {
  try {
    console.log("➡ Sending OTP request to QuickeKYC");

    const response = await axios.post(
      `${QUICKEKYC_BASE_URL}/generate-otp`,
      {
        key: API_KEY,
        id_number: aadhaarNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: TIMEOUT,
      }
    );

    console.log("📩 QuickeKYC Response:", response.data);

    if (
      response.data.status === "success" &&
      response.data.data?.otp_sent
    ) {
      console.log("✔ OTP Sent Successfully");
      console.log("Request ID:", response.data.request_id);

      return {
        success: true,
        request_id: response.data.request_id,
        data: response.data.data,
      };
    }

    console.log("❌ OTP Sending Failed:", response.data);

    return {
      success: false,
      statusCode: 400,
      message:
        "We couldn't send the OTP right now. Please check your Aadhaar number and try again.",
      response: response.data,
    };
  } catch (error) {
    console.error("🔥 OTP API Error:", {
      message: error.message,
      apiResponse: error.response?.data,
    });

    return {
      success: false,
      statusCode: 500,
      message:
        "Unable to send OTP at the moment. Please try again shortly.",
      error: error.message,
    };
  }
}

async function verifyAadhaarOtp(requestId, otp) {
  try {
    console.log("➡ Verifying OTP with QuickeKYC");

    const response = await axios.post(
      `${QUICKEKYC_BASE_URL}/submit-otp`,
      {
        key: API_KEY,
        request_id: requestId.toString(),
        otp,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: TIMEOUT,
      }
    );

    console.log("🔹 QuickeKYC Response:");
    console.log(JSON.stringify(response.data, null, 2));

    if (
      response.data.status !== "success" ||
      !response.data.data
    ) {
      console.log("❌ OTP Verification Failed:", response.data);

      return {
        success: false,
        statusCode: 400,
        message:
          response.data.message ||
          "OTP verification failed or timed out.",
        response: response.data,
      };
    }

    const verifiedData = response.data.data;

    console.log("✅ Aadhaar Verified Data:");
    console.log(JSON.stringify(verifiedData, null, 2));

    return {
      success: true,
      data: verifiedData,
    };
  } catch (error) {
    console.error("🔥 OTP Verify API Error:", {
      message: error.message,
      apiResponse: error.response?.data,
    });

    return {
      success: false,
      statusCode: 500,
      message:
        "Unable to verify OTP at the moment. Please try again shortly.",
      error: error.message,
    };
  }
}

module.exports = {
  sendAadhaarOtp,
  verifyAadhaarOtp,
};
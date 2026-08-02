const crypto = require("crypto");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const { Otp } = require("../models");
const ApiError = require("../utils/apiError");

const normalizePhone = (raw) => {
  let phone = String(raw || "").trim().replace(/[\s-]/g, "");
  if (phone.startsWith("+91")) phone = phone.slice(3);
  else if (phone.startsWith("91") && phone.length === 12) phone = phone.slice(2);
  return phone;
};

const isIndianMobile = (phone) => /^[6-9]\d{9}$/.test(phone);

const generateCode = () => String(crypto.randomInt(100000, 999999));

/** WhatsApp OTP via MyOperator (same template as the legacy `utils/dlt.js`). */
async function sendWhatsAppOtp(phone, code) {
  if (!env.myoperator.apiKey) {
    if (env.isProd) throw ApiError.internal("OTP gateway not configured");
    console.log(`[otp] DEV MODE — code for ${phone} is ${code}`);
    return { dev: true };
  }

  const { data } = await axios.post(
    "https://publicapi.myoperator.co/chat/messages",
    {
      phone_number_id: env.myoperator.phoneNumberId,
      customer_country_code: "91",
      customer_number: phone,
      type: "template",
      data: {
        type: "template",
        context: {
          template_name: "login_otp",
          language: "en",
          category: "authentication",
          body: { otp: code },
          buttons: [{ index: 0, otp: code }],
        },
      },
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.myoperator.apiKey}`,
        "X-MYOP-COMPANY-ID": env.myoperator.companyId,
      },
      timeout: 15000,
    }
  );
  return data;
}

async function issueOtp(rawPhone, purpose = "login", tripRef = null) {
  const phone = normalizePhone(rawPhone);
  if (!isIndianMobile(phone)) throw ApiError.badRequest("Invalid Indian mobile number");

  // one live OTP per phone+purpose
  await Otp.deleteMany({ phoneNumber: phone, purpose, consumedAt: null });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + env.otp.ttlMinutes * 60 * 1000);

  await Otp.create({ phoneNumber: phone, codeHash, purpose, tripRef, expiresAt });
  await sendWhatsAppOtp(phone, code);

  return {
    phoneNumber: phone,
    expiresAt,
    ...(env.isProd ? {} : { devCode: code }),
  };
}

async function verifyOtp(rawPhone, code, purpose = "login") {
  const phone = normalizePhone(rawPhone);

  const record = await Otp.findOne({
    phoneNumber: phone,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) throw ApiError.badRequest("OTP expired or not found. Please request a new one.");
  if (record.attempts >= env.otp.maxAttempts) {
    throw ApiError.tooMany("Too many incorrect attempts. Please request a new OTP.");
  }

  const matched = await bcrypt.compare(String(code), record.codeHash);
  if (!matched) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest("Incorrect OTP");
  }

  record.consumedAt = new Date();
  await record.save();
  return { phoneNumber: phone, tripRef: record.tripRef };
}

module.exports = { issueOtp, verifyOtp, normalizePhone, isIndianMobile };

const crypto = require("crypto");
const Razorpay = require("razorpay");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

let client = null;
function getClient() {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw ApiError.internal("Razorpay keys are not configured");
  }
  if (!client) {
    client = new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
  }
  return client;
}

/** @param amountInPaise integer paise */
async function createOrder({ amountInPaise, receipt, notes = {} }) {
  const order = await getClient().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    payment_capture: 1,
    notes,
  });
  return { ...order, key: env.razorpay.keyId };
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature || "")));
}

function verifyWebhookSignature(rawBody, signature) {
  if (!env.razorpay.webhookSecret) return false;
  const expected = crypto
    .createHmac("sha256", env.razorpay.webhookSecret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature || "")));
  } catch {
    return false;
  }
}

const fetchPayment = (paymentId) => getClient().payments.fetch(paymentId);

module.exports = { createOrder, verifyPaymentSignature, verifyWebhookSignature, fetchPayment, getClient };

// utils/razorpay.js

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Fee = require("../models/fee.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order using fee configuration from DB
 *
 * type_of_fee examples:
 * - car_mechanic
 * - tour
 * - guide
 * - recovery_vehicle
 * - car_access
 * - rto
 */
async function createKycOrder(receiptId, type_of_fee) {
  if (!type_of_fee) {
    throw new Error("Fee type is required");
  }

  const fee = await Fee.findOne({
    key: type_of_fee,
  });

  if (!fee) {
    throw new Error(`Fee configuration not found for: ${type_of_fee}`);
  }

  if (fee.value === undefined || fee.value === null || fee.value < 0) {
    throw new Error(`Invalid fee amount for: ${type_of_fee}`);
  }

  // Razorpay accepts amount in paise
  const amount = Math.round(Number(fee.value) * 100);

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: receiptId,
    payment_capture: 1,
  });

  return {
    order,
    fee: {
      key: fee.key,
      value: fee.value,
      amountInPaise: amount,
    },
  };
}


/**
 * Verify Razorpay payment signature
 */
function verifyRazorpaySignature({
  order_id,
  payment_id,
  signature,
}) {
  const generated = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(`${order_id}|${payment_id}`)
    .digest("hex");

  return generated === signature;
}


module.exports = {
  razorpay,
  createKycOrder,
  verifyRazorpaySignature,
};

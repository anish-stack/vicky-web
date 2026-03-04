const crypto = require('crypto');
const axios = require('axios');
// const Ordermodel = require('../models/Order.model')
// const Settings = require('../models/Setting');
const Razorpay = require('razorpay');
// const meetingModel = require('../models/meeting.model');

// async function initiatePayment(req, res, order) {
//     try {
//         const { totalAmount } = req.body;
//         const SettingsFind = await Settings.findOne()
//         const transactionId = crypto.randomBytes(9).toString('hex');
//         const merchantUserId = crypto.randomBytes(12).toString('hex');

//         const merchantId = process.env.PHONEPE_MERCHANT_ID || SettingsFind?.paymentGateway?.key;
//         const apiKey = process.env.PHONEPE_MERCHANT_KEY || SettingsFind?.paymentGateway?.secret;


//         const data = {
//             merchantId: merchantId,
//             merchantTransactionId: transactionId,
//             merchantUserId: merchantUserId,
//             name: "User",
//             amount: totalAmount * 100,
//             callbackUrl: 'https://api.grandmasala.in/payment-failed',
//             redirectUrl: `https://api.grandmasala.in/api/v1/verify-payment/${transactionId}`,
//             redirectMode: 'POST',
//             paymentInstrument: {
//                 type: 'PAY_PAGE',
//             },
//         };


//         const payload = JSON.stringify(data);
//         const payloadMain = Buffer.from(payload).toString('base64');
//         const keyIndex = 1;


//         const string = payloadMain + '/pg/v1/pay' + apiKey;
//         const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//         const checksum = sha256 + '###' + keyIndex;


//         const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";



//         const options = {
//             method: 'POST',
//             url: prod_URL,
//             headers: {
//                 accept: 'application/json',
//                 'Content-Type': 'application/json',
//                 'X-VERIFY': checksum,
//             },
//             data: {
//                 request: payloadMain,
//             },
//         };

//         // Make the Axios request
//         const response = await axios.request(options);
//         // console.log("response.data.data.orderId", response.data.data.merchantTransactionId)
//         const date = new Date()
//         // console.log(date)
//         if (response.status) {
//             const findOrder = await Order.findById(order?._id)
//             if (findOrder) {
//                 findOrder.payment = {
//                     method: 'PAY_PAGE',
//                     paymentInital: date,
//                     phonepeOrderId: response.data.data.merchantTransactionId,
//                     status: "pending",
//                 };
//             }
//             await findOrder.save();
//         }
//         // console.log(response.data.data.instrumentResponse.redirectInfo.url)
//         res.status(201).json({
//             success: true,
//             msg: "Payment initiated successfully",
//             amount: totalAmount,
//             phonepeOrderId: response.data.data?.merchantTransactionId,
//             order: order,
//             success: true,
//             url: response.data.data.instrumentResponse.redirectInfo.url,
//         });
//     } catch (error) {
//         console.error("Error initiating payment:", error);
//         res.status(501).json({
//             success: false,
//             msg: "Payment initiation failed",
//         });
//     }
// }


exports.initiateRazorpay = async (req, res, order,amount) => {
  console.log("🔔 initiateRazorpay FUNCTION HIT");

  try {
    

    return res.status(201).json({
      success: true,
      msg: "Payment initiated successfully",
    });

  } catch (error) {
    console.error("🔥 ERROR in initiateRazorpay:", {
      message: error.message,
      error,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      msg: "Payment initiation failed",
      error: error?.error || error?.message || error,
    });
  }
}

// module.exports = { initiateRazorpay };
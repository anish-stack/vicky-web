import Razorpay from 'razorpay';

// Auto-switch between test and live credentials based on the environment.
const isProd = process.env.NODE_ENV === 'production';
const keyId = process.env.RAZORPAY_LIVE_KEY_ID
const keySecret = process.env.RAZORPAY_LIVE_KEY_SECRET

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { amount, userId, userName } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ success: false, error: "Invalid amount" });
    }

    try {
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        payment_capture: 1,
        notes: {
          userId: userId || "unknown",
          userName: userName || "not_provided",
        },
      });

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // const { amount } = req.body;
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


// import Razorpay from 'razorpay';
// import { NextRequest, NextResponse } from 'next/server';

// const razorpay = new Razorpay({
//  key_id: process.env.RAZORPAY_KEY_ID!,
//  key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST(request: NextRequest) {
//  const { amount, currency } = (await request.json()) as {
//   amount: string;
//   currency: string;
//  };

//  var options = {
//   amount: amount,
//   currency: currency,
//   receipt: 'rcp1',
//  };
//  const order = await razorpay.orders.create(options);
//  console.log(order);
//  return NextResponse.json({ orderId: order.id }, { status: 200 });
// }
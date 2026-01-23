

export default async function handler(req, res) {

  const { payment_id } = req.body;
  if (!payment_id) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  const username = process.env.RAZORPAY_KEY_ID;
  const password =  process.env.RAZORPAY_KEY_SECRET;

  const base64Credentials = btoa(username + ":" + password);

  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json(await response.json());
    }

    const paymentDetails = await response.json();
    return res.status(200).json(paymentDetails);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return res.status(500).json({ error: 'Failed to fetch payment details' });
  }
}

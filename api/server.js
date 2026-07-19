const app = require('./app');
require('dotenv').config();
const config = require('./config/config.json');

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

const db = config[ENV] || {};
const razorpayMode = ENV === 'production' ? 'LIVE' : 'TEST';
const razorpayKeyId =
  ENV === 'production'
    ? process.env.RAZORPAY_LIVE_KEY_ID
    : process.env.RAZORPAY_TEST_KEY_ID;

app.listen(PORT, () => {
  console.log('--------------------------------------------------');
  console.log(`  TaxiSafar API listening on port ${PORT}`);
  console.log(`  Environment : ${ENV}`);
  console.log(
    `  Database    : ${db.database || 'N/A'} @ ${db.host || 'N/A'} (user: ${db.username || 'N/A'})`
  );
  console.log(`  Razorpay    : ${razorpayMode} mode (${razorpayKeyId || 'key missing'})`);
  console.log('--------------------------------------------------');
});
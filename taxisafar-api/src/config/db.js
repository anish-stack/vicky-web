const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const env = require("./env");

mongoose.set("strictQuery", true);

/**
 * `.lean()` skips document hydration, which also skips virtuals — so without
 * this plugin every lean read returned `_id` and no `id`, and any client that
 * relied on `id` (the whole admin panel) sent `undefined` back in its URLs.
 *
 * Registered globally so all 17 lean reads behave the same as `toJSON()`.
 */
mongoose.plugin(mongooseLeanVirtuals);

async function connectDB() {
  await mongoose.connect(env.mongoUri, {
    autoIndex: !env.isProd,
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`[db] connected -> ${mongoose.connection.name}`);
  return mongoose.connection;
}

module.exports = { connectDB, mongoose };
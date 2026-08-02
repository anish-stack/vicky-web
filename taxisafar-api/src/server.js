const app = require("./app");
const env = require("./config/env");
const { connectDB, mongoose } = require("./config/db");

let server;

async function start() {
  await connectDB();
  server = app.listen(env.port, () => {
    console.log(`[api] listening on :${env.port} (${env.nodeEnv})`);
  });
}

const shutdown = async (signal) => {
  console.log(`\n[api] ${signal} received, shutting down...`);
  if (server) await new Promise((r) => server.close(r));
  await mongoose.connection.close();
  process.exit(0);
};

["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));

process.on("unhandledRejection", (err) => {
  console.error("[api] unhandled rejection:", err);
});

start().catch((err) => {
  console.error("[api] failed to start:", err);
  process.exit(1);
});

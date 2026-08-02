const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const env = require("./config/env");
const routes = require("./routes");
const { apiLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/error");
const paymentController = require("./controllers/payment.controller");

const app = express();

app.set("trust proxy", 1);

/* ---- security & basics ---- */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);

      // Allow every origin
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(morgan(env.isProd ? "combined" : "dev"));

/**
 * Razorpay webhook must see the raw bytes for HMAC verification, so it is
 * mounted before the JSON body parser.
 */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

/* ---- static uploads ---- */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

/* ---- health ---- */
app.get("/health", (req, res) =>
  res.json({ status: true, service: "taxisafar-api", env: env.nodeEnv, uptime: process.uptime() })
);

/* ---- api ---- */
app.use("/api", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

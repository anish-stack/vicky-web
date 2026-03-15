const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const { ipKeyGenerator } = require("express-rate-limit");

dotenv.config();
connectDB();

const app = express();
// app.set("trust proxy", true);
app.set("trust proxy", 1);
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000","http://127.0.0.1:5173","http://localhost:5173","https://taxisafar.com","https://www.taxisafar.com","https://taxisafar.com","https://app.admin.taxisafar.com","https://www.app.admin.taxisafar.com"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." }
});
app.use(globalLimiter);

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    if (req.body?.phone) return req.body.phone;
    return ipKeyGenerator(req);
  },
  message: { success: false, message: "Too many OTP requests. Please try again in 15 minutes." }
});

app.use("/api/auth/send-login-otp", otpLimiter);
app.use("/api/auth/resend-otp", otpLimiter);
app.use("/api/auth/register", otpLimiter);

app.get("/", (req, res) => {
  res.json({ success: true, message: "TaxiSafar partner API Running ✅", version: "1.0.0" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contact", require("./routes/contact"));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TaxiSafar server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;
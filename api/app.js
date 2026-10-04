const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const cityRoutes = require("./routes/cityRoutes");
const vehicleRoutes = require("./routes/vehicleRoute");
const mapRoutes = require("./routes/googleMapRoutes");
const checkTimeRoutes = require("./routes/checkTimeRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const tripRoutes = require("./routes/tripRoutes");
const airportRoutes = require("./routes/airportRoutes");
const localrentalplanRoutes = require("./routes/localrentalplanRoutes");
const advancePaymentRoutes = require("./routes/advancePaymentRoutes");
const dhamPackageRoutes = require("./routes/dhamPackagesRoutes");
const dhamCategoryRoutes = require("./routes/dhamCategoryRoutes");
const discountRoutes = require("./routes/discountRoutes");
const bookingLimitRoutes = require("./routes/bookingLimitRoutes");
const sequelize = require("./config/database");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const tourPackagesRoutes = require("./routes/tourPackagesRoutes");
const tourPackageBookingRoutes = require("./routes/tourPackageBookingRoutes");
const tourHotelRoutes = require("./routes/tourHotelRoutes");
const tourCouponRoutes = require("./routes/tourCouponRoutes");

const config = require("./config/config.json");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const morgan = require("morgan");

const app = express();

// behind nginx / Cloudflare: real client IP + https protocol
app.set("trust proxy", true);

app.use(express.static(path.join(__dirname, "public")));
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(
    morgan(":method :url :status :response-time ms - :remote-addr")
);
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/checktime", checkTimeRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/trip", tripRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/localrentalplans", localrentalplanRoutes);
app.use("/api/airport", airportRoutes);
app.use("/api/advance_payment", advancePaymentRoutes);
app.use("/api/dham_package", dhamPackageRoutes);
app.use("/api/dham_category", dhamCategoryRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api/booking_limit", bookingLimitRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/tour-package", tourPackagesRoutes);
app.use("/api/tour-booking", tourPackageBookingRoutes);
app.use("/api/tour-hotel", tourHotelRoutes);
app.use("/api/tour-coupon", tourCouponRoutes);

app.use("/api/dashboard", dashboardRoutes);

// JSON 404 for unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({ status: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// JSON error handler (multer file-type errors, bad JSON bodies, etc.)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || (err.name === "MulterError" ? 400 : 500);
    if (status >= 500) console.error(err);
    let message = err.message || "Internal server error";
    if (err.code === "LIMIT_FILE_SIZE") message = "Image is too large. Maximum size is 10 MB per image.";
    if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") message = "Too many images in one request.";
    res.status(status).json({ status: false, message });
});

module.exports = app;
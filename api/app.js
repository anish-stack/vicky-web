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
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccount.json");
// const { Sequelize } = require('sequelize');
const config = require("./config/config.json");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(cors());

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

module.exports = app;

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const { Op } = require("sequelize");
require("dotenv").config();

const { TourPackageBooking, TourPackage, User, otp } = require("../models");
const sendDltMessage = require("../utils/dlt");
const { sendTourPackageBooking, sendTourPackageDriver } = require("../utils/sendWhatsapp");

const SECRET_KEY = process.env.JWT_SECRET || "dev-insecure-secret";
const isProd = process.env.NODE_ENV === "production";
const RZP_KEY_ID = isProd ? process.env.RAZORPAY_LIVE_KEY_ID : process.env.RAZORPAY_TEST_KEY_ID;
const RZP_KEY_SECRET = isProd ? process.env.RAZORPAY_LIVE_KEY_SECRET : process.env.RAZORPAY_TEST_KEY_SECRET;

const razorpay = new Razorpay({ key_id: RZP_KEY_ID, key_secret: RZP_KEY_SECRET });

// ---------------- helpers ----------------
const normalizePhone = (v) => String(v || "").replace("+91", "").replace(/\D/g, "").slice(-10);

const genBookingRef = () => `TP${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 89)}`;

const toNum = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// returns number within [min,max] or null
const toCoord = (v, min, max) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Number(n.toFixed(7));
};

const cleanPlaceId = (v) => {
  const s = String(v || "").trim();
  return s && s.length <= 255 && /^[\w\-:]+$/.test(s) ? s : null;
};

// ============================================================
// POST /send-otp  { mobile }
// ============================================================
exports.sendOtp = async (req, res) => {
  try {
    const mobile = normalizePhone(req.body.mobile);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ status: false, message: "Enter a valid 10-digit mobile number" });
    }

    let isNewUser = false;
    let user = await User.findOne({ where: { phone_number: mobile } });
    if (!user) {
      isNewUser = true;
      user = await User.create({ name: "User", phone_number: mobile, role: "customer" });
    }

    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await sendDltMessage(mobile, OTP);

    const existingOTP = await otp.findOne({ where: { phone_number: mobile, otp_type: "login" } });
    if (existingOTP) {
      await existingOTP.update({ otp: OTP, expires_at });
    } else {
      await otp.create({ phone_number: mobile, otp: OTP, otp_type: "login", expires_at });
    }

    return res.status(200).json({ status: true, message: "OTP sent successfully", isNewUser });
  } catch (error) {
    console.error("❌ tourBooking sendOtp Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to send OTP" });
  }
};

// ============================================================
// POST /verify-otp  { mobile, otp }
// ============================================================
exports.verifyOtp = async (req, res) => {
  try {
    const mobile = normalizePhone(req.body.mobile);
    const OTP = String(req.body.otp || "").trim();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ status: false, message: "Enter a valid 10-digit mobile number" });
    }
    if (!/^\d{4}$/.test(OTP)) {
      return res.status(400).json({ status: false, message: "OTP must be a 4-digit number" });
    }

    const record = await otp.findOne({ where: { phone_number: mobile, otp_type: "login" } });
    if (!record) {
      return res.status(400).json({ status: false, message: "No OTP found. Please request OTP again." });
    }
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ status: false, message: "OTP expired. Please request a new OTP." });
    }
    if (record.otp !== OTP) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    await record.destroy();

    const user = await User.findOne({ where: { phone_number: mobile } });

    const verify_token = jwt.sign({ mobile, purpose: "tour_booking" }, SECRET_KEY, { expiresIn: "30m" });

    return res.status(200).json({
      status: true,
      message: "Mobile number verified",
      data: { verify_token, name: user?.name && user.name !== "User" ? user.name : "" },
    });
  } catch (error) {
    console.error("❌ tourBooking verifyOtp Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to verify OTP" });
  }
};

// ============================================================
// POST /create-order  { verify_token, tour_package_id, ...booking fields }
// ============================================================
exports.createOrder = async (req, res) => {
  try {
    const {
      verify_token,
      tour_package_id,
      tour_title,
      tour_slug,
      name,
      mobile,
      email,
      pickup_address,
      pickup_lat,
      pickup_lng,
      pickup_place_id,
      pickup_date,
      pickup_time,
      return_date,
      return_time,
      adults,
      rooms,
      vehicle_label,
      vehicle_price,
      hotel_name,
      hotel_nights,
      hotel_price,
      notes,
      total_amount,
      booking_charge_percent,
      advance_amount,
    } = req.body;

    if (!verify_token) {
      return res.status(401).json({ status: false, message: "Mobile number not verified" });
    }

    let decoded;
    try {
      decoded = jwt.verify(verify_token, SECRET_KEY);
    } catch {
      return res.status(401).json({ status: false, message: "Verification expired. Please verify your mobile again." });
    }
    if (decoded.purpose !== "tour_booking") {
      return res.status(401).json({ status: false, message: "Invalid verification token" });
    }

    const normMobile = normalizePhone(mobile);
    if (decoded.mobile !== normMobile) {
      return res.status(400).json({ status: false, message: "Mobile number does not match verified number" });
    }

    if (!tour_package_id || !name || !normMobile) {
      return res.status(400).json({ status: false, message: "Missing required booking details" });
    }

    if (!pickup_address || String(pickup_address).trim().length < 5) {
      return res.status(400).json({ status: false, message: "Pickup location is required" });
    }

    const advance = Math.round(toNum(advance_amount));
    if (!advance || advance < 1) {
      return res.status(400).json({ status: false, message: "Invalid payable amount" });
    }

    // coords: both or none
    let lat = toCoord(pickup_lat, -90, 90);
    let lng = toCoord(pickup_lng, -180, 180);
    if (lat === null || lng === null) {
      lat = null;
      lng = null;
    }

    const user = await User.findOne({ where: { phone_number: normMobile } });
    const total = toNum(total_amount);

    const booking = await TourPackageBooking.create({
      booking_ref: genBookingRef(),
      tour_package_id,
      tour_title: tour_title || null,
      tour_slug: tour_slug || null,
      user_id: user?.id || null,
      name,
      mobile: normMobile,
      email: email || null,
      pickup_address: String(pickup_address).trim(),
      pickup_lat: lat,
      pickup_lng: lng,
      pickup_place_id: cleanPlaceId(pickup_place_id),
      pickup_date: pickup_date || null,
      pickup_time: pickup_time || null,
      return_date: return_date || null,
      return_time: return_time || null,
      adults: toNum(adults, 1),
      rooms: toNum(rooms, 1),
      vehicle_label: vehicle_label || null,
      vehicle_price: toNum(vehicle_price),
      hotel_name: hotel_name || null,
      hotel_nights: hotel_nights ? toNum(hotel_nights) : null,
      hotel_price: toNum(hotel_price),
      notes: notes || null,
      total_amount: total,
      booking_charge_percent: toNum(booking_charge_percent, 10),
      advance_amount: advance,
      balance_amount: Math.max(total - advance, 0),
      payment_status: "pending",
      booking_status: "pending",
    });

    const order = await razorpay.orders.create({
      amount: advance * 100,
      currency: "INR",
      payment_capture: 1,
      receipt: booking.booking_ref,
      notes: { booking_id: String(booking.id), tour_package_id: String(tour_package_id), mobile: normMobile },
    });

    await booking.update({ razorpay_order_id: order.id });

    return res.status(200).json({
      status: true,
      message: "Order created",
      data: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        order: { id: order.id, amount: order.amount, currency: order.currency, key: RZP_KEY_ID },
      },
    });
  } catch (error) {
    console.error("❌ tourBooking createOrder Error:", error);
    return res.status(500).json({ status: false, message: error?.error?.description || error.message || "Failed to create order" });
  }
};

// ============================================================
// POST /verify-payment  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// ============================================================
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: false, message: "Missing payment details" });
    }

    const booking = await TourPackageBooking.findOne({ where: { razorpay_order_id } });
    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found for this order" });
    }

    const expected = crypto
      .createHmac("sha256", RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await booking.update({ payment_status: "failed" });
      return res.status(400).json({ status: false, message: "Payment verification failed" });
    }

    const totalAmount = Number(booking.total_amount || 0);
    const advanceAmount = Number(booking.advance_amount || 0);
    const balanceAmount = Number(booking.balance_amount || 0);

    let paymentStatus = "partial";
    if (totalAmount > 0 && balanceAmount <= 0) paymentStatus = "paid";
    if (advanceAmount <= 0 && balanceAmount > 0) paymentStatus = "pending";

    await booking.update({
      razorpay_payment_id,
      razorpay_signature,
      payment_status: paymentStatus,
      booking_status: "confirmed",
    });

    sendTourPackageBooking(booking.mobile, booking.toJSON())
      .then((result) => console.log("✅ Tour booking WhatsApp sent:", result))
      .catch((error) => console.error("❌ Tour booking WhatsApp error:", error));

    return res.status(200).json({
      status: true,
      message: "Payment verified",
      data: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        payment_status: booking.payment_status,
        booking_status: booking.booking_status,
      },
    });
  } catch (error) {
    console.error("❌ tourBooking verifyPayment Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to verify payment" });
  }
};

// ============================================================
// GET /booking-ref/:ref  (booking success page)
// ============================================================
exports.getByRef = async (req, res) => {
  try {
    const booking = await TourPackageBooking.findOne({ where: { booking_ref: req.params.ref } });
    if (!booking) return res.status(404).json({ status: false, message: "Booking not found" });
    return res.json({ status: true, data: booking });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ============================================================
// GET /my?mobile=xxxxxxxxxx  (customer "my bookings" dashboard)
// ============================================================
exports.myBookings = async (req, res) => {
  try {
    const mobile = normalizePhone(req.query.mobile);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ status: false, message: "Enter a valid 10-digit mobile number" });
    }
    const rows = await TourPackageBooking.findAll({ where: { mobile }, order: [["created_at", "DESC"]] });
    return res.json({ status: true, data: rows });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ============================================================
// ADMIN: GET /admin/list
// ============================================================
exports.adminList = async (req, res) => {
  try {
    const { search = "", booking_status, payment_status } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.items_per_page ?? req.query.limit, 10) || 20, 1), 100);

    const where = {};
    const term = String(search).trim();
    if (term) {
      where[Op.or] = [
        { booking_ref: { [Op.like]: `%${term}%` } },
        { name: { [Op.like]: `%${term}%` } },
        { mobile: { [Op.like]: `%${term}%` } },
        { tour_title: { [Op.like]: `%${term}%` } },
        { pickup_address: { [Op.like]: `%${term}%` } },
      ];
    }
    if (booking_status) where.booking_status = booking_status;
    if (payment_status) where.payment_status = payment_status;

    const { count, rows } = await TourPackageBooking.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    const lastPage = Math.max(Math.ceil(count / perPage), 1);
    const pagination = {
      page,
      items_per_page: perPage,
      total: count,
      last_page: lastPage,
      has_prev: page > 1,
      has_next: page < lastPage,
    };

    return res.json({ status: true, data: rows, payload: { pagination }, pagination });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ============================================================
// ADMIN: GET /admin/:id
// ============================================================
exports.adminGet = async (req, res) => {
  try {
    const booking = await TourPackageBooking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ status: false, message: "Booking not found" });

    let tourPackage = null;
    if (booking.tour_package_id) tourPackage = await TourPackage.findByPk(booking.tour_package_id);

    const b = booking.toJSON();
    const pickup_map_url =
      b.pickup_lat != null && b.pickup_lng != null
        ? `https://www.google.com/maps/search/?api=1&query=${b.pickup_lat},${b.pickup_lng}${b.pickup_place_id ? `&query_place_id=${b.pickup_place_id}` : ""}`
        : b.pickup_address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.pickup_address)}`
        : null;

    return res.json({ status: true, data: { ...b, pickup_map_url, tourPackage } });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ============================================================
// ADMIN: PUT /admin/:id  { booking_status?, payment_status?, admin_notes? }
// ============================================================
exports.adminUpdate = async (req, res) => {
  try {
    const booking = await TourPackageBooking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ status: false, message: "Booking not found" });

    const { booking_status, payment_status, admin_notes } = req.body;
    const patch = {};

    if (booking_status && ["pending", "confirmed", "cancelled", "completed"].includes(booking_status)) {
      patch.booking_status = booking_status;
    }
    if (payment_status && ["pending", "partial", "paid", "failed", "refunded"].includes(payment_status)) {
      patch.payment_status = payment_status;
    }
    if (admin_notes !== undefined) patch.admin_notes = admin_notes;

    await booking.update(patch);

    return res.status(200).json({ status: true, message: "Booking updated successfully", data: booking });
  } catch (error) {
    console.error("❌ tourBooking adminUpdate Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to update booking" });
  }
};

// ============================================================
// ADMIN: POST /admin/:id/send-driver-details
// body: { driver_name, driver_mobile, vehicle_number, vehicle_label }
// ============================================================
exports.sendDriverDetails = async (req, res) => {
  try {
    const booking = await TourPackageBooking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ status: false, message: "Booking not found" });

    const { driver_name, driver_mobile, vehicle_number, vehicle_label } = req.body;

    if (!driver_name || !driver_mobile || !vehicle_number || !vehicle_label) {
      return res.status(400).json({
        status: false,
        message: "driver_name, driver_mobile, vehicle_number and vehicle_label are required",
      });
    }

    const mobile = normalizePhone(driver_mobile);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ status: false, message: "Enter a valid 10-digit driver mobile number" });
    }

    await booking.update({
      driver_name,
      driver_mobile: mobile,
      vehicle_number,
      assigned_vehicle_label: vehicle_label,
    });

    const result = await sendTourPackageDriver(booking.mobile, booking.toJSON(), {
      driver_name,
      driver_mobile: mobile,
      vehicle_number,
      vehicle_label,
    });

    if (!result) {
      return res.status(500).json({
        status: false,
        message: "Driver details saved, but WhatsApp message could not be sent",
        data: { booking_ref: booking.booking_ref, driver_name, driver_mobile: mobile, vehicle_number, vehicle_label },
      });
    }

    return res.status(200).json({
      status: true,
      message: "Driver details saved and sent successfully",
      data: {
        booking_ref: booking.booking_ref,
        customer_mobile: booking.mobile,
        driver_name,
        driver_mobile: mobile,
        vehicle_number,
        vehicle_label,
      },
    });
  } catch (error) {
    console.error("❌ tourBooking sendDriverDetails Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to save and send driver details" });
  }
};
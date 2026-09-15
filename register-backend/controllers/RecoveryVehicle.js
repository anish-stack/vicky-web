// controllers/CarMechnic.controller.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const RecoveryVehicleUser = require("../models/RecoveryVehicleUser");
const RecoveryContactLog = require("../models/RecoveryContact");
const { generateOTP, getOTPExpiry, isOTPExpired } = require("../utils/Otputils");
const sendDltMessage = require("../utils/DltMessage");
const { createKycOrder, verifyRazorpaySignature } = require("../utils/razorpay");
const { sendAadhaarOtp, verifyAadhaarOtp } = require("../utils/aadhaarKyc");
const feeModel = require("../models/fee.model");

const base_url = "https://partners.taxisafar.com";

const fileUrl = (req, filename) => {
  if (!filename) return null;

  return `${base_url}/uploads/mechanics/${filename}`;
};
const safeUnlink = (filePath) => {
  fs.unlink(filePath, (err) => { if (err && err.code !== "ENOENT") console.error("unlink err:", err); });
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "recovery");

const saveAadhaarPhoto = (base64, id) => {
  if (!base64) return null;
  try {
    const clean = String(base64).replace(/^data:image\/\w+;base64,/, "");
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const filename = `aadhaar_${id}_${Date.now()}.jpg`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(clean, "base64"));
    return `${base_url}/uploads/mechanics/${filename}`;
  } catch (e) { console.error("aadhaar photo save err:", e.message); return null; }
};
/* ======================================================
   USER SIDE — SELF REGISTER / PROFILE / DISCOVERY
====================================================== */


// STEP 1: create razorpay order for kyc fee 
exports.createRecoveryKycOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const RecoveryPerson = await RecoveryVehicleUser.findById(id);
    if (!RecoveryPerson) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    if (RecoveryPerson.isKycFeeDone) {
      return res.status(400).json({ success: false, data: null, message: "KYC fee already paid" });
    }

    const order = await createKycOrder(`kyc_${id}_${Date.now()}`, "kyc_fee_for_recovery_vehicle");
    console.log(order)
    return res.json({
      success: true,
      order,
      data: { orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID },
      message: "Order created",
    });
  } catch (err) {
    console.error("createRecoveryKycOrder err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to create order" });
  }
};

// STEP 2: verify payment -> unlock aadhaar otp step
exports.verifyRecoveryKycPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, data: null, message: "Missing payment details" });
    }

    const isValid = verifyRazorpaySignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, data: null, message: "Payment verification failed" });
    }
    const RecoveryPerson = await RecoveryVehicleUser.findById(id);
    if (!RecoveryPerson) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    const fee = await feeModel.findOne({ key: "kyc_fee_for_recovery_vehicle", });
    if (!fee) {
      return res.status(500).json({
        success: false, data: null,
        message: "Recovery vehicle KYC fee configuration not found",
      });
    }
    RecoveryPerson.isKycFeeDone = true;
    RecoveryPerson.howMuchItsPaid = fee.value;
    RecoveryPerson.kycStatus = "payment done";
    RecoveryPerson.kycPayment =
    {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: fee.value,
      paidAt: new Date(),
    };
    await RecoveryPerson.save();

    return res.json({ success: true, data: RecoveryPerson, message: "Payment verified, KYC fee done" });
  } catch (err) {
    console.error("verifyMechanicKycPayment err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to verify payment" });
  }
};

// STEP 3: send aadhaar otp (only if fee paid)
exports.sendRecoveryAadhaarOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { aadhaarNumber } = req.body;

    // Validate Aadhaar number
    if (!aadhaarNumber) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Aadhaar number is required",
      });
    }

    const RecoveryPerson = await RecoveryVehicleUser.findById(id);


    if (!RecoveryPerson) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Mechanic not found",
      });
    }

    // KYC fee check
    if (!RecoveryPerson.isKycFeeDone) {
      return res.status(402).json({
        success: false,
        data: null,
        message: "Please complete ₹99 KYC fee payment first",
      });
    }

    // Already completed
    if (RecoveryPerson.kycStatus === "kyc-success") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "KYC already completed",
      });
    }

    // Send OTP
    const result = await sendAadhaarOtp(aadhaarNumber);

    console.log("🔹 Aadhaar OTP Result:", result);

    // QuickeKYC utility returns:
    // {
    //   success: true,
    //   request_id: 16132853,
    //   data: {
    //     otp_sent: true
    //   }
    // }

    if (!result?.success || !result?.data?.otp_sent) {
      console.log("❌ Aadhaar OTP Send Failed:", result);

      return res.status(result?.statusCode || 400).json({
        success: false,
        data: null,
        message:
          result?.message ||
          "Couldn't send OTP. Please check the Aadhaar number and try again.",
        response: result,
      });
    }

    // Save Aadhaar request details
    RecoveryPerson.aadharData = {
      aadhaarNumber,
      request_id: result.request_id,
    };

    // Optional: mark KYC as pending
    RecoveryPerson.kycStatus = "pending";

    await RecoveryPerson.save();

    // Success response
    return res.status(200).json({
      success: true,
      data: {
        request_id: result.request_id,
      },
      message: "OTP sent to Aadhaar linked mobile number",
    });
  } catch (err) {
    console.error("🔥 sendRecoveryAadhaarOtp Error:", {
      message: err.message,
      response: err.response?.data,
    });

    return res.status(500).json({
      success: false,
      data: null,
      message:
        "Unable to send OTP at the moment. Please try again shortly.",
    });
  }
};


// STEP 4: verify aadhaar otp -> finalize kyc
exports.verifyRecoveryPersonAadhaarOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const RecoveryPerson = await RecoveryVehicleUser.findById(id);

    if (!RecoveryPerson) return res.status(404).json({ success: false, data: null, message: "Recovery Person not found" });

    if (!RecoveryPerson.isKycFeeDone) {
      return res.status(402).json({ success: false, data: null, message: "KYC fee not paid yet" });
    }
    console.log(RecoveryPerson.aadharData)
    const requestId = RecoveryPerson.aadharData?.request_id;
    if (!requestId) {
      return res.status(400).json({ success: false, data: null, message: "No OTP request found. Please resend OTP." });
    }

    if (!otp) {
      return res.status(400).json({ success: false, data: null, message: "OTP is required" });
    }

    const result = await verifyAadhaarOtp(requestId, otp);

    if (!result?.success || !result?.data) {
      console.log("❌ Aadhaar OTP Verify Failed:", result);
      RecoveryPerson.kycStatus = "kyc-failed";
      await RecoveryPerson.save();
      return res.status(400).json({
        success: false,
        data: null,
        message: result.message || "OTP verification failed or timed out.",
      });
    }
    const photo = result.data.profile_image || result.data.photo || result.data.image || null;
    const photoUrl = saveAadhaarPhoto(photo, RecoveryPerson._id);
    if (photoUrl) {
      RecoveryPerson.aadharData.verifiedData.profile_image = photoUrl;
      if (!RecoveryPerson.profileImage) RecoveryPerson.profileImage = photoUrl;   // auto profile pic
    }
    if (result.data.full_name) {
      RecoveryPerson.name = result.data.full_name;
    }
    RecoveryPerson.aadharData = { ...RecoveryPerson.aadharData, verifiedData: result.data };
    RecoveryPerson.kycStatus = "kyc-success";
    RecoveryPerson.isVerifiedProvider = true;
    RecoveryPerson.markModified("aadharData");

    await RecoveryPerson.save();
    await sendPartnerRegister(RecoveryPerson.phone, RecoveryPerson._id)

    const data = RecoveryPerson.toObject();
    delete data.otp;
    delete data.otpExpiry;

    return res.status(200).json({ success: true, data, message: "Aadhaar verified. Account activated." });
  } catch (err) {
    console.error("verifyRecoveryPersonAadhaarOtp err:", err.response?.data || err.message);
    return res.status(500).json({ success: false, data: null, message: "Unable to verify OTP at the moment. Please try again shortly." });
  }
};


// controllers/CarMechnic.controller.js — inside registerRecoveryVehicle, replace destructure + create/update blocks

exports.registerRecoveryVehicle = async (req, res) => {
  try {
    const {
      name, garageName, phone, email, address, experienceYears,
      referralPhone, referralDriverId, referralDriverName,
    } = req.body;

    if (!phone || !name || !garageName) {
      return res.status(400).json({ success: false, message: "Name, Garage Name, and Phone are required." });
    }

    let provider = await RecoveryVehicleUser.findOne({ phone });
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    let parsedAddress = address;
    if (typeof address === "string") {
      try { parsedAddress = JSON.parse(address); } catch (e) { parsedAddress = undefined; }
    }

    let galleryImageUrls = provider ? provider.galleryImages : [];
    if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
      const newGalleryUrls = req.files.galleryImages.map(file => fileUrl(req, file.filename));
      galleryImageUrls = [...galleryImageUrls, ...newGalleryUrls];
    }

    if (provider) {
      provider.name = name || provider.name;
      provider.garageName = garageName || provider.garageName;
      provider.email = email || provider.email;
      if (galleryImageUrls.length > 0) provider.galleryImages = galleryImageUrls;
      if (parsedAddress) provider.address = { ...provider.address?.toObject?.() || provider.address, ...parsedAddress };
      if (experienceYears !== undefined && experienceYears !== "") provider.experienceYears = Number(experienceYears);
      if (referralPhone !== undefined) provider.referralPhone = referralPhone;
      if (referralDriverId !== undefined) provider.referralDriverId = referralDriverId;
      if (referralDriverName !== undefined) provider.referralDriverName = referralDriverName;

      provider.otp = otp;
      provider.otpExpiry = otpExpiry;
      provider.isMobileVerified = false;
      await provider.save();
    } else {
      provider = await RecoveryVehicleUser.create({
        name, garageName, phone, email,
        galleryImages: galleryImageUrls,
        address: parsedAddress || {},
        experienceYears: experienceYears ? Number(experienceYears) : 0,
        operatorName: name,
        referralPhone: referralPhone || null,
        referralDriverId: referralDriverId || null,
        referralDriverName: referralDriverName || null,
        otp, otpExpiry, isMobileVerified: false,
      });
    }

    try { await sendDltMessage(phone, otp); } catch (smsErr) { console.error("SMS sending failed:", smsErr); }

    return res.status(200).json({
      success: true,
      message: "Registration initiated. OTP sent to mobile.",
      data: { id: provider._id, phone: provider.phone }
    });
  } catch (err) {
    console.error("registerRecoveryVehicle err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to register provider" });
  }
};
// --- VERIFY OTP ---
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required." });
    }

    const provider = await RecoveryVehicleUser.findOne({ phone });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found." });
    }
    if (provider.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
    if (isOTPExpired(provider.otpExpiry)) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    provider.isMobileVerified = true;
    provider.otp = undefined;
    provider.otpExpiry = undefined;
    await provider.save();

    return res.status(200).json({ success: true, message: "Mobile verified successfully.", data: provider });
  } catch (err) {
    console.error("verifyOTP err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to verify OTP" });
  }
};

// --- RESEND OTP ---
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "Phone is required." });

    const provider = await RecoveryVehicleUser.findOne({ phone });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    const otp = generateOTP();
    provider.otp = otp;
    provider.otpExpiry = getOTPExpiry();
    provider.isMobileVerified = false;
    await provider.save();

    try {
      await sendDltMessage(phone, otp);
    } catch (smsErr) {
      console.error("SMS sending failed:", smsErr);
    }

    return res.status(200).json({ success: true, message: "OTP resent." });
  } catch (err) {
    console.error("resendOTP err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to resend OTP" });
  }
};

// --- GET MY PROFILE (self) ---
exports.getMyProfile = async (req, res) => {
  try {
    const { phone, id } = req.query;
    const query = id && isValidId(id) ? { _id: id } : { phone };
    if (!query.phone && !query._id) {
      return res.status(400).json({ success: false, message: "Phone or id is required." });
    }

    const provider = await RecoveryVehicleUser.findOne(query);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    return res.json({ success: true, data: provider, message: "Profile fetched successfully" });
  } catch (err) {
    console.error("getMyProfile err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch profile" });
  }
};

// --- UPDATE MY PROFILE (self, no admin-only fields) ---
exports.updateMyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });

    const provider = await RecoveryVehicleUser.findById(id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    const {
      name, garageName, email, about, tagline, experienceYears, startingPrice,
      serviceArea, operatorName, licenseNumber, servicesOffered, vehiclesRecoveredTypes,
      address, availabilitySummary, isOpenNow, callHistoryEnabled, whatsappHistoryEnabled, numberMasked
    } = req.body;

    let parsedAddress = address;
    if (typeof address === "string") {
      try { parsedAddress = JSON.parse(address); } catch (e) { parsedAddress = undefined; }
    }

    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      if (provider.profileImage) {
        const oldPath = path.join(__dirname, "..", "uploads", "mechanics", path.basename(provider.profileImage));
        safeUnlink(oldPath);
      }
      provider.profileImage = fileUrl(req, req.files.profileImage[0].filename);
    }

    if (req.files && req.files.galleryImages && req.files.galleryImages.length) {
      const newImgs = req.files.galleryImages.map((f) => fileUrl(req, f.filename));
      provider.galleryImages = [...(provider.galleryImages || []), ...newImgs];
    }

    if (name) provider.name = name;
    if (garageName) provider.garageName = garageName;
    if (email) provider.email = email;
    if (about) provider.about = about;
    if (tagline) provider.tagline = tagline;
    if (experienceYears !== undefined) provider.experienceYears = experienceYears;
    if (startingPrice !== undefined) provider.startingPrice = startingPrice;
    if (serviceArea) provider.serviceArea = serviceArea;
    if (operatorName) provider.operatorName = operatorName;
    if (licenseNumber) provider.licenseNumber = licenseNumber;
    if (Array.isArray(servicesOffered)) provider.servicesOffered = servicesOffered;
    if (Array.isArray(vehiclesRecoveredTypes)) provider.vehiclesRecoveredTypes = vehiclesRecoveredTypes;
    if (parsedAddress) provider.address = { ...provider.address?.toObject?.() || provider.address, ...parsedAddress };
    if (availabilitySummary) provider.availabilitySummary = availabilitySummary;
    if (isOpenNow !== undefined) provider.isOpenNow = isOpenNow === "true" || isOpenNow === true;
    if (callHistoryEnabled !== undefined) provider.callHistoryEnabled = callHistoryEnabled === "true" || callHistoryEnabled === true;
    if (whatsappHistoryEnabled !== undefined) provider.whatsappHistoryEnabled = whatsappHistoryEnabled === "true" || whatsappHistoryEnabled === true;
    if (numberMasked !== undefined) provider.numberMasked = numberMasked === "true" || numberMasked === true;

    await provider.save();
    return res.json({ success: true, data: provider, message: "Profile updated successfully" });
  } catch (err) {
    console.error("updateMyProfile err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update profile" });
  }
};

// --- REMOVE ONE GALLERY IMAGE (self) ---
exports.removeGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });
    if (!imageUrl) return res.status(400).json({ success: false, message: "imageUrl is required." });

    const provider = await RecoveryVehicleUser.findById(id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    provider.galleryImages = (provider.galleryImages || []).filter((img) => img !== imageUrl);
    await provider.save();

    const localPath = path.join(__dirname, "..", "uploads", "mechanics", path.basename(imageUrl));
    safeUnlink(localPath);

    return res.json({ success: true, data: provider, message: "Image removed successfully" });
  } catch (err) {
    console.error("removeGalleryImage err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to remove image" });
  }
};

// --- GET ALL RECOVERY VEHICLES (public/user facing — active only, filters & search) ---
exports.getAllRecoveryVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city, service, lat, lng, radiusKm = 10 } = req.query;

    const query = { profileStatus: "active" };

    if (city) query["address.city"] = new RegExp(city, "i");
    if (service) query.servicesOffered = { $in: [new RegExp(service, "i")] };
    if (search) query.$text = { $search: search };

    if (lat && lng) {
      query["address.location"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radiusKm) * 1000
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      RecoveryVehicleUser.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      RecoveryVehicleUser.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Recovery vehicles fetched successfully",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("getAllRecoveryVehicles err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch recovery vehicles" });
  }
};

// --- GET SINGLE PROVIDER BY ID (public/user facing) ---
exports.getRecoveryVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });

    const provider = await RecoveryVehicleUser.findById(id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    return res.json({ success: true, data: provider, message: "Provider fetched successfully" });
  } catch (err) {
    console.error("getRecoveryVehicleById err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch provider" });
  }
};

/* ======================================================
   ADMIN SIDE
====================================================== */

// --- ADMIN: GET ALL (any status, full filters, sort) ---
exports.adminGetAllRecoveryVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city, status, service, isVerifiedProvider, isTrusted, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const query = {};
    if (status) query.profileStatus = status;
    if (city) query["address.city"] = new RegExp(city, "i");
    if (service) query.servicesOffered = { $in: [new RegExp(service, "i")] };
    if (isVerifiedProvider !== undefined) query.isVerifiedProvider = isVerifiedProvider === "true";
    if (isTrusted !== undefined) query.isTrusted = isTrusted === "true";
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { garageName: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { "address.city": new RegExp(search, "i") }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [data, total] = await Promise.all([
      RecoveryVehicleUser.find(query).skip(skip).limit(parseInt(limit)).sort(sort),
      RecoveryVehicleUser.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Recovery vehicles fetched successfully",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("adminGetAllRecoveryVehicles err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch recovery vehicles" });
  }
};

// --- ADMIN: GET ONE (full doc, no status filter) ---
exports.adminGetRecoveryVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });

    const provider = await RecoveryVehicleUser.findById(id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    const [totalCalls, totalWhatsapp, lastContact] = await Promise.all([
      RecoveryContactLog.countDocuments({ recoveryPersonId: id, type: "call" }),
      RecoveryContactLog.countDocuments({ recoveryPersonId: id, type: "whatsapp" }),
      RecoveryContactLog.findOne({ recoveryPersonId: id }).sort({ createdAt: -1 })
    ]);

    return res.json({
      success: true,
      data: { provider, stats: { totalCalls, totalWhatsapp, lastContact } },
      message: "Provider fetched successfully"
    });
  } catch (err) {
    console.error("adminGetRecoveryVehicleById err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch provider" });
  }
};

// --- ADMIN: CREATE PROVIDER DIRECTLY (no OTP) ---
exports.adminCreateRecoveryVehicle = async (req, res) => {
  try {
    const body = req.body;
    if (!body.phone || !body.name || !body.garageName) {
      return res.status(400).json({ success: false, message: "Name, Garage Name, and Phone are required." });
    }

    const existing = await RecoveryVehicleUser.findOne({ phone: body.phone });
    if (existing) return res.status(409).json({ success: false, message: "Provider with this phone already exists." });

    let parsedAddress = body.address;
    if (typeof parsedAddress === "string") {
      try { parsedAddress = JSON.parse(parsedAddress); } catch (e) { parsedAddress = {}; }
    }

    let profileImageUrl;
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      profileImageUrl = fileUrl(req, req.files.profileImage[0].filename);
    }
    let galleryImages = [];
    if (req.files && req.files.galleryImages && req.files.galleryImages.length) {
      galleryImages = req.files.galleryImages.map((f) => fileUrl(req, f.filename));
    }

    const provider = await RecoveryVehicleUser.create({
      ...body,
      address: parsedAddress || {},
      profileImage: profileImageUrl,
      galleryImages,
      isMobileVerified: true,
      isVerifiedProvider: body.isVerifiedProvider ?? true
    });

    return res.status(201).json({ success: true, data: provider, message: "Provider created successfully" });
  } catch (err) {
    console.error("adminCreateRecoveryVehicle err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create provider" });
  }
};

// --- ADMIN: UPDATE ANY FIELD (full control) ---
exports.adminUpdateRecoveryVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });

    const provider = await RecoveryVehicleUser.findById(id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    const updatable = [
      "name", "garageName", "email", "about", "tagline", "isVerifiedProvider", "isTrusted",
      "profileStatus", "isOpenNow", "experienceYears", "vehiclesRecoveredCount", "successRatePercentage",
      "availabilitySummary", "rating", "reviewCount", "servicesOffered", "vehiclesRecoveredTypes",
      "startingPrice", "serviceArea", "operatorName", "licenseNumber", "callHistoryEnabled",
      "whatsappHistoryEnabled", "numberMasked", "isMobileVerified"
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) provider[field] = req.body[field];
    });

    if (req.body.address) {
      let parsedAddress = req.body.address;
      if (typeof parsedAddress === "string") {
        try { parsedAddress = JSON.parse(parsedAddress); } catch (e) { parsedAddress = undefined; }
      }
      if (parsedAddress) provider.address = { ...provider.address?.toObject?.() || provider.address, ...parsedAddress };
    }

    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      if (provider.profileImage) {
        const oldPath = path.join(__dirname, "..", "uploads", "mechanics", path.basename(provider.profileImage));
        safeUnlink(oldPath);
      }
      provider.profileImage = fileUrl(req, req.files.profileImage[0].filename);
    }

    if (req.files && req.files.galleryImages && req.files.galleryImages.length) {
      const newImgs = req.files.galleryImages.map((f) => fileUrl(req, f.filename));
      provider.galleryImages = [...(provider.galleryImages || []), ...newImgs];
    }

    await provider.save();
    return res.json({ success: true, data: provider, message: "Provider updated successfully" });
  } catch (err) {
    console.error("adminUpdateRecoveryVehicle err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update provider" });
  }
};

// --- ADMIN: CHANGE STATUS (active / inactive / suspended) ---
exports.adminUpdateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });
    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const provider = await RecoveryVehicleUser.findByIdAndUpdate(id, { profileStatus: status }, { new: true });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    return res.json({ success: true, data: provider, message: `Provider marked as ${status}` });
  } catch (err) {
    console.error("adminUpdateProviderStatus err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update status" });
  }
};

// --- ADMIN: TOGGLE VERIFIED / TRUSTED BADGES ---
exports.adminUpdateProviderBadges = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerifiedProvider, isTrusted } = req.body;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });

    const update = {};
    if (isVerifiedProvider !== undefined) update.isVerifiedProvider = isVerifiedProvider;
    if (isTrusted !== undefined) update.isTrusted = isTrusted;

    const provider = await RecoveryVehicleUser.findByIdAndUpdate(id, update, { new: true });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    return res.json({ success: true, data: provider, message: "Badges updated successfully" });
  } catch (err) {
    console.error("adminUpdateProviderBadges err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update badges" });
  }
};

// --- ADMIN: DELETE PROVIDER (+ files + contact logs) ---
exports.adminDeleteRecoveryVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });

    const provider = await RecoveryVehicleUser.findById(id);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    if (provider.profileImage) {
      safeUnlink(path.join(__dirname, "..", "uploads", "mechanics", path.basename(provider.profileImage)));
    }
    (provider.galleryImages || []).forEach((img) => {
      safeUnlink(path.join(__dirname, "..", "uploads", "mechanics", path.basename(img)));
    });

    await Promise.all([
      RecoveryVehicleUser.findByIdAndDelete(id),
      RecoveryContactLog.deleteMany({ recoveryPersonId: id })
    ]);

    return res.json({ success: true, message: "Provider deleted successfully" });
  } catch (err) {
    console.error("adminDeleteRecoveryVehicle err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to delete provider" });
  }
};

// --- ADMIN: DASHBOARD STATS ---
exports.adminGetStats = async (req, res) => {
  try {
    const [total, active, inactive, suspended, verified, trusted] = await Promise.all([
      RecoveryVehicleUser.countDocuments({}),
      RecoveryVehicleUser.countDocuments({ profileStatus: "active" }),
      RecoveryVehicleUser.countDocuments({ profileStatus: "inactive" }),
      RecoveryVehicleUser.countDocuments({ profileStatus: "suspended" }),
      RecoveryVehicleUser.countDocuments({ isVerifiedProvider: true }),
      RecoveryVehicleUser.countDocuments({ isTrusted: true })
    ]);

    const [totalCalls, totalWhatsapp] = await Promise.all([
      RecoveryContactLog.countDocuments({ type: "call" }),
      RecoveryContactLog.countDocuments({ type: "whatsapp" })
    ]);

    return res.json({
      success: true,
      data: {
        providers: { total, active, inactive, suspended, verified, trusted },
        contacts: { totalCalls, totalWhatsapp, total: totalCalls + totalWhatsapp }
      },
      message: "Stats fetched successfully"
    });
  } catch (err) {
    console.error("adminGetStats err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch stats" });
  }
};

/* ======================================================
   CONTACT LOGS (call / whatsapp)
====================================================== */

// --- CREATE CONTACT LOG (user taps call/whatsapp on a provider) ---
exports.createContactLog = async (req, res) => {
  try {
    const { recoveryPersonId, userId, userPhone, type, platform, appVersion } = req.body;

    if (!recoveryPersonId || !userId || !userPhone || !type) {
      return res.status(400).json({ success: false, message: "recoveryPersonId, userId, userPhone and type are required." });
    }
    if (!isValidId(recoveryPersonId)) {
      return res.status(400).json({ success: false, message: "Invalid recoveryPersonId." });
    }
    if (!["call", "whatsapp"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be 'call' or 'whatsapp'." });
    }

    const provider = await RecoveryVehicleUser.findById(recoveryPersonId);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });

    const log = await RecoveryContactLog.create({
      recoveryPersonId,
      userId,
      userPhone,
      type,
      status: "initiated",
      meta: { platform, appVersion }
    });

    return res.status(201).json({ success: true, data: log, message: "Contact log created successfully" });
  } catch (err) {
    console.error("createContactLog err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create contact log" });
  }
};

// --- UPDATE CONTACT LOG STATUS (e.g. completed, missed, failed) ---
exports.updateContactLogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid log id." });
    if (!status) return res.status(400).json({ success: false, message: "status is required." });

    const log = await RecoveryContactLog.findByIdAndUpdate(id, { status }, { new: true });
    if (!log) return res.status(404).json({ success: false, message: "Contact log not found." });

    return res.json({ success: true, data: log, message: "Contact log updated successfully" });
  } catch (err) {
    console.error("updateContactLogStatus err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update contact log" });
  }
};

// --- GET CONTACT LOGS FOR A USER (self history) ---
exports.getMyContactLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      RecoveryContactLog.find(query).populate("recoveryPersonId", "name garageName profileImage phone").skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      RecoveryContactLog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Contact logs fetched successfully",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("getMyContactLogs err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch contact logs" });
  }
};

// --- ADMIN: GET CONTACT LOGS FOR ONE PROVIDER ---
exports.adminGetProviderContactLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: "Invalid provider id." });

    const query = { recoveryPersonId: id };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      RecoveryContactLog.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      RecoveryContactLog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Contact logs fetched successfully",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("adminGetProviderContactLogs err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch contact logs" });
  }
};

// --- ADMIN: GET ALL CONTACT LOGS (global, filterable) ---
exports.adminGetAllContactLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, recoveryPersonId, userId, from, to } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (recoveryPersonId && isValidId(recoveryPersonId)) query.recoveryPersonId = recoveryPersonId;
    if (userId) query.userId = userId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      RecoveryContactLog.find(query).populate("recoveryPersonId", "name garageName profileImage phone").skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      RecoveryContactLog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Contact logs fetched successfully",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("adminGetAllContactLogs err:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch contact logs" });
  }
};
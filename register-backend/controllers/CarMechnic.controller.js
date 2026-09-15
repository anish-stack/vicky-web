// controllers/CarMechnic.controller.js
const fs = require("fs");
const path = require("path");
const CarMechanicUser = require("../models/CarMechanic.model");
const MechanicContactLog = require("../models/MechanicContactLog.model");
const { SERVICE_LIST, CAR_BRANDS, VEHICLE_TYPES, FACILITIES } = require("../constants/mechanicOptions");
const { generateOTP, getOTPExpiry, isOTPExpired } = require("../utils/Otputils");
const sendDltMessage = require("../utils/DltMessage");
const base_url = "https://partners.taxisafar.com";
const { createKycOrder, verifyRazorpaySignature } = require("../utils/razorpay");
const { sendAadhaarOtp, verifyAadhaarOtp } = require("../utils/aadhaarKyc");
const { sendPartnerRegister } = require("../utils/sendWhatsapp");

const fileUrl = (req, filename) => {
  if (!filename) return null;

  return `${base_url}/uploads/mechanics/${filename}`;
};


const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "mechanics");

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
const safeUnlink = (filePath) => {
  fs.unlink(filePath, (err) => { if (err && err.code !== "ENOENT") console.error("unlink err:", err); });
};

exports.getMechanicOptions = async (req, res) => {
  return res.json({
    success: true,
    data: { services: SERVICE_LIST, brands: CAR_BRANDS, vehicleTypes: VEHICLE_TYPES, facilities: FACILITIES },
    message: "Options fetched"
  });
};


// STEP 1: create razorpay order for kyc fee (₹99)
exports.createMechanicKycOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const mechanic = await CarMechanicUser.findById(id);
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    if (mechanic.isKycFeeDone) {
      return res.status(400).json({ success: false, data: null, message: "KYC fee already paid" });
    }

    const order = await createKycOrder(`kyc_${id}_${Date.now()}`, "kyc_fee_for_car_mechanic");

    return res.json({
      success: true,
      order,
      data: { orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID },
      message: "Order created",
    });
  } catch (err) {
    console.error("createMechanicKycOrder err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to create order" });
  }
};

// STEP 2: verify payment -> unlock aadhaar otp step
exports.verifyMechanicKycPayment = async (req, res) => {
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

    const mechanic = await CarMechanicUser.findById(id);
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    mechanic.isKycFeeDone = true;
    mechanic.howMuchItsPaid = 99;
    mechanic.kycStatus = "payment done";
    await mechanic.save();

    return res.json({ success: true, data: mechanic, message: "Payment verified, KYC fee done" });
  } catch (err) {
    console.error("verifyMechanicKycPayment err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to verify payment" });
  }
};

// STEP 3: send aadhaar otp (only if fee paid)
exports.sendMechanicAadhaarOtp = async (req, res) => {
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

    // Find mechanic
    const mechanic = await CarMechanicUser.findById(id);

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Mechanic not found",
      });
    }

    // KYC fee check
    if (!mechanic.isKycFeeDone) {
      return res.status(402).json({
        success: false,
        data: null,
        message: "Please complete ₹99 KYC fee payment first",
      });
    }

    // Already completed
    if (mechanic.kycStatus === "kyc-success") {
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
    mechanic.aadharData = {
      aadhaarNumber,
      request_id: result.request_id,
    };

    // Optional: mark KYC as pending
    mechanic.kycStatus = "pending";

    await mechanic.save();

    // Success response
    return res.status(200).json({
      success: true,
      data: {
        request_id: result.request_id,
      },
      message: "OTP sent to Aadhaar linked mobile number",
    });
  } catch (err) {
    console.error("🔥 sendMechanicAadhaarOtp Error:", {
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
exports.verifyMechanicAadhaarOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const mechanic = await CarMechanicUser.findById(id);
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    if (!mechanic.isKycFeeDone) {
      return res.status(402).json({ success: false, data: null, message: "KYC fee not paid yet" });
    }
    const requestId = mechanic.aadharData?.request_id;
    if (!requestId) {
      return res.status(400).json({ success: false, data: null, message: "No OTP request found. Please resend OTP." });
    }

    if (!otp) {
      return res.status(400).json({ success: false, data: null, message: "OTP is required" });
    }

    const result = await verifyAadhaarOtp(requestId, otp);

    if (!result?.success || !result?.data) {
      console.log("❌ Aadhaar OTP Verify Failed:", result);
      mechanic.kycStatus = "kyc-failed";
      await mechanic.save();
      return res.status(400).json({
        success: false,
        data: null,
        message: result.message || "OTP verification failed or timed out.",
      });
    }

    const photo = result.data.profile_image || result.data.photo || result.data.image || null;
    const photoUrl = saveAadhaarPhoto(photo, mechanic._id);
    if (photoUrl) {
      mechanic.aadharData.verifiedData.profile_image = photoUrl;
      if (!mechanic.profileImage) mechanic.profileImage = photoUrl;   // auto profile pic
    }
    if (result.data.full_name) {
      mechanic.name = result.data.full_name;
    }
    mechanic.aadharData = { ...mechanic.aadharData, verifiedData: result.data };
    mechanic.kycStatus = "kyc-success";
    mechanic.isVerifiedMechanic = true;
    mechanic.markModified("aadharData");
    await mechanic.save();

    const data = mechanic.toObject();
    delete data.otp;
    delete data.otpExpiry;
    await sendPartnerRegister(mechanic.phone, mechanic._id)
    return res.status(200).json({ success: true, data, message: "Aadhaar verified. Account activated." });
  } catch (err) {
    console.error("verifyMechanicAadhaarOtp err:", err.response?.data || err.message);
    return res.status(500).json({ success: false, data: null, message: "Unable to verify OTP at the moment. Please try again shortly." });
  }
};

// CREATE — creates mechanic (unverified) + sends OTP
exports.createMechanic = async (req, res) => {
  try {
    const body = { ...req.body };

    ["servicesOffered", "brandsServiced", "vehicleTypesServiced", "facilities", "whyChooseUs", "workingHours", "address"].forEach((k) => {
      if (typeof body[k] === "string") {
        try { body[k] = JSON.parse(body[k]); } catch (_) { }
      }
    });

    if (!body.phone) {
      return res.status(400).json({ success: false, data: null, message: "Phone is required" });
    }

    const existingPhone = await CarMechanicUser.findOne({ phone: body.phone });
    if (existingPhone && existingPhone.isPhoneVerified) {
      return res.status(409).json({ success: false, data: null, message: "Phone already registered" });
    }

    if (req.files?.profileImage?.[0]) body.profileImage = fileUrl(req, req.files.profileImage[0].filename);
    if (req.files?.coverImage?.[0]) body.coverImage = fileUrl(req, req.files.coverImage[0].filename);
    if (req.files?.galleryImages?.length) body.galleryImages = req.files.galleryImages.map(f => fileUrl(req, f.filename));

    const otp = generateOTP();
    body.otp = otp;
    body.otpExpiry = getOTPExpiry();
    body.isPhoneVerified = false;

    let mechanic;
    if (existingPhone) {
      // re-registering unverified phone: overwrite with fresh data + new otp
      mechanic = await CarMechanicUser.findByIdAndUpdate(existingPhone._id, body, { new: true, runValidators: true });
    } else {
      mechanic = await CarMechanicUser.create(body);
    }

    await sendDltMessage(body.phone, otp).catch(console.error);

    const data = mechanic.toObject();
    delete data.otp;
    delete data.otpExpiry;

    return res.status(201).json({ success: true, data, message: "Mechanic created, OTP sent" });
  } catch (err) {
    console.error("createMechanic err:", err);
    if (err.code === 11000) return res.status(409).json({ success: false, data: null, message: "Phone already registered" });
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to create mechanic" });
  }
};

// VERIFY OTP
exports.verifyMechanicOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, data: null, message: "Phone and OTP are required" });
    }

    const mechanic = await CarMechanicUser.findOne({ phone }).select("+otp +otpExpiry");
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    if (mechanic.isPhoneVerified) {
      return res.status(400).json({ success: false, data: null, message: "Phone already verified" });
    }

    if (!mechanic.otp || mechanic.otp !== otp) {
      return res.status(400).json({ success: false, data: null, message: "Invalid OTP" });
    }

    if (isOTPExpired(mechanic.otpExpiry)) {
      return res.status(400).json({ success: false, data: null, message: "OTP expired, please resend" });
    }

    mechanic.isPhoneVerified = true;
    mechanic.otp = undefined;
    mechanic.otpExpiry = undefined;
    await mechanic.save();

    return res.json({ success: true, data: mechanic, message: "Phone verified successfully" });
  } catch (err) {
    console.error("verifyMechanicOtp err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to verify OTP" });
  }
};

// RESEND OTP
exports.resendMechanicOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, data: null, message: "Phone is required" });

    const mechanic = await CarMechanicUser.findOne({ phone });
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    if (mechanic.isPhoneVerified) {
      return res.status(400).json({ success: false, data: null, message: "Phone already verified" });
    }

    const otp = generateOTP();
    mechanic.otp = otp;
    mechanic.otpExpiry = getOTPExpiry();
    await mechanic.save();

    await sendDltMessage(phone, otp).catch(console.error);

    return res.json({ success: true, data: null, message: "OTP resent" });
  } catch (err) {
    console.error("resendMechanicOtp err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to resend OTP" });
  }
};

// UPDATE
exports.updateMechanic = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await CarMechanicUser.findById(id);
    if (!existing) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    const body = { ...req.body };
    ["servicesOffered", "brandsServiced", "vehicleTypesServiced", "facilities", "whyChooseUs", "workingHours", "address"].forEach((k) => {
      if (typeof body[k] === "string") {
        try { body[k] = JSON.parse(body[k]); } catch (_) { }
      }
    });

    // phone change requires re-verification
    if (body.phone && body.phone !== existing.phone) {
      body.isPhoneVerified = false;
    }

    if (req.files?.profileImage?.[0]) {
      if (existing.profileImage) safeUnlink(path.join(__dirname, "..", "uploads", "mechanics", path.basename(existing.profileImage)));
      body.profileImage = fileUrl(req, req.files.profileImage[0].filename);
    }
    if (req.files?.coverImage?.[0]) {
      if (existing.coverImage) safeUnlink(path.join(__dirname, "..", "uploads", "mechanics", path.basename(existing.coverImage)));
      body.coverImage = fileUrl(req, req.files.coverImage[0].filename);
    }
    if (req.files?.galleryImages?.length) {
      const newGallery = req.files.galleryImages.map(f => fileUrl(req, f.filename));
      body.galleryImages = [...(existing.galleryImages || []), ...newGallery];
    }

    const updated = await CarMechanicUser.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (body.isPhoneVerified === false) {
      const otp = generateOTP();
      updated.otp = otp;
      updated.otpExpiry = getOTPExpiry();
      await updated.save();
      await sendDltMessage(updated.phone, otp).catch(console.error);
    }

    return res.json({ success: true, data: updated, message: "Mechanic updated" });
  } catch (err) {
    console.error("updateMechanic err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to update mechanic" });
  }
};

// DELETE
exports.deleteMechanic = async (req, res) => {
  try {
    const { id } = req.params;
    const mechanic = await CarMechanicUser.findById(id);
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    const dir = path.join(__dirname, "..", "uploads", "mechanics");
    if (mechanic.profileImage) safeUnlink(path.join(dir, path.basename(mechanic.profileImage)));
    if (mechanic.coverImage) safeUnlink(path.join(dir, path.basename(mechanic.coverImage)));
    (mechanic.galleryImages || []).forEach(img => safeUnlink(path.join(dir, path.basename(img))));

    await mechanic.deleteOne();
    await MechanicContactLog.deleteMany({ mechanicId: id });

    return res.json({ success: true, data: null, message: "Mechanic deleted" });
  } catch (err) {
    console.error("deleteMechanic err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to delete mechanic" });
  }
};

// GET ALL
exports.getAllMechanics = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city, status, lat, lng, radiusKm = 10 } = req.query;

    const query = {};
    if (status) query.profileStatus = status;
    if (city) query["address.city"] = new RegExp(city, "i");
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
      CarMechanicUser.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      CarMechanicUser.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Mechanics fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("getAllMechanics err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch mechanics" });
  }
};

// GET ONE
exports.getOneMechanic = async (req, res) => {
  try {
    const mechanic = await CarMechanicUser.findById(req.params.id);
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });
    return res.json({ success: true, data: mechanic, message: "Mechanic fetched" });
  } catch (err) {
    console.error("getOneMechanic err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch mechanic" });
  }
};

// ADMIN: toggle status (active / blocked / hidden)
exports.updateMechanicStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["active", "blocked", "hidden"].includes(status)) {
      return res.status(400).json({ success: false, data: null, message: "Invalid status value" });
    }

    const mechanic = await CarMechanicUser.findByIdAndUpdate(
      id,
      {
        profileStatus: status,
        statusReason: reason || "",
        statusUpdatedBy: req.admin?._id || null,
        statusUpdatedAt: new Date()
      },
      { new: true }
    );

    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });
    return res.json({ success: true, data: mechanic, message: `Mechanic marked ${status}` });
  } catch (err) {
    console.error("updateMechanicStatus err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to update status" });
  }
};

// CONTACT TRACKING (call / whatsapp)
exports.trackContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, userId, userPhone, platform, appVersion } = req.body;

    if (!["call", "whatsapp"].includes(type)) {
      return res.status(400).json({ success: false, data: null, message: "Invalid contact type" });
    }

    const mechanic = await CarMechanicUser.findById(id);
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    const log = await MechanicContactLog.create({
      mechanicId: id,
      userId: userId || null,
      userPhone,
      type,
      meta: { platform, appVersion }
    });

    return res.status(201).json({ success: true, data: log, message: `${type} logged` });
  } catch (err) {
    console.error("trackContact err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to log contact" });
  }
};

// ADMIN: get contact logs for a mechanic
exports.getMechanicContactLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const query = { mechanicId: id };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      MechanicContactLog.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      MechanicContactLog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Contact logs fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("getMechanicContactLogs err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch logs" });
  }
};

// ADMIN: get contact logs for a userId

exports.getMechanicContactLogsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const query = { userId: userId };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      MechanicContactLog.find(query)
        .populate('mechanicId', 'name garageName profileImage address specialty phone') // Populate mechanic details
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      MechanicContactLog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data,
      message: "Contact logs fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("getMechanicContactLogs err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch logs" });
  }
};
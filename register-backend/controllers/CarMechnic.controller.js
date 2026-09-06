// controllers/CarMechnic.controller.js
const fs = require("fs");
const path = require("path");
const CarMechanicUser = require("../models/CarMechanic.model");
const MechanicContactLog = require("../models/MechanicContactLog.model");
const { SERVICE_LIST, CAR_BRANDS, VEHICLE_TYPES, FACILITIES } = require("../constants/mechanicOptions");
const { generateOTP, getOTPExpiry, isOTPExpired } = require("../utils/Otputils");
const sendDltMessage = require("../utils/DltMessage");

const fileUrl = (req, filename) => `${req.protocol}://${req.get("host")}/uploads/mechanics/${filename}`;

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

// CREATE — creates mechanic (unverified) + sends OTP
exports.createMechanic = async (req, res) => {
  try {
    const body = { ...req.body };

    ["servicesOffered", "brandsServiced", "vehicleTypesServiced", "facilities", "whyChooseUs", "workingHours", "address"].forEach((k) => {
      if (typeof body[k] === "string") {
        try { body[k] = JSON.parse(body[k]); } catch (_) {}
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
        try { body[k] = JSON.parse(body[k]); } catch (_) {}
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
    const { type, userPhone, platform, appVersion } = req.body;

    if (!["call", "whatsapp"].includes(type)) {
      return res.status(400).json({ success: false, data: null, message: "Invalid contact type" });
    }

    const mechanic = await CarMechanicUser.findById(id);
    if (!mechanic) return res.status(404).json({ success: false, data: null, message: "Mechanic not found" });

    const log = await MechanicContactLog.create({
      mechanicId: id,
      userId: req.user?._id || null,
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
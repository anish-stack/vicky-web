// controllers/CarMechnic.controller.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const RecoveryVehicleUser = require("../models/RecoveryVehicleUser");
const RecoveryContactLog = require("../models/RecoveryContact");
const { generateOTP, getOTPExpiry, isOTPExpired } = require("../utils/Otputils");
const sendDltMessage = require("../utils/DltMessage");

const base_url = "https://partners.taxisafar.com";

const fileUrl = (req, filename) => {
    if (!filename) return null;

    return `${base_url}/uploads/mechanics/${filename}`;
};
const safeUnlink = (filePath) => {
  fs.unlink(filePath, (err) => { if (err && err.code !== "ENOENT") console.error("unlink err:", err); });
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ======================================================
   USER SIDE — SELF REGISTER / PROFILE / DISCOVERY
====================================================== */

exports.registerRecoveryVehicle = async (req, res) => {
  try {
    const { 
      name, 
      garageName, 
      phone, 
      email, 
      address, 
      experienceYears, 
      startingPrice, 
      serviceArea, 
      operatorName, 
      licenseNumber,
      tagline,
      about,
      availabilitySummary,
      servicesOffered,       // <--- Added
      vehiclesRecoveredTypes // <--- Added
    } = req.body;

    if (!phone || !name || !garageName) {
      return res.status(400).json({ success: false, message: "Name, Garage Name, and Phone are required." });
    }

    let provider = await RecoveryVehicleUser.findOne({ phone });

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Parse Address if sent as string
    let parsedAddress = address;
    if (typeof address === "string") {
      try { parsedAddress = JSON.parse(address); } catch (e) { parsedAddress = undefined; }
    }

    // Parse Services Offered if sent as string (JSON)
    let parsedServices = servicesOffered;
    if (typeof servicesOffered === "string") {
      try { parsedServices = JSON.parse(servicesOffered); } catch (e) { parsedServices = undefined; }
    }

    // Parse Vehicles Recovered Types if sent as string (JSON)
    let parsedVehicles = vehiclesRecoveredTypes;
    if (typeof vehiclesRecoveredTypes === "string") {
      try { parsedVehicles = JSON.parse(vehiclesRecoveredTypes); } catch (e) { parsedVehicles = undefined; }
    }

    // 1. Handle Profile Image Upload
    let profileImageUrl = provider ? provider.profileImage : undefined;
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      if (provider && provider.profileImage) {
        const oldPath = path.join(__dirname, "..", "uploads", "mechanics", path.basename(provider.profileImage));
        safeUnlink(oldPath);
      }
      profileImageUrl = fileUrl(req, req.files.profileImage[0].filename);
    }

    // 2. Handle Gallery Images Upload (Multiple files)
    let galleryImageUrls = provider ? provider.galleryImages : [];
    if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
      const newGalleryUrls = req.files.galleryImages.map(file => fileUrl(req, file.filename));
      galleryImageUrls = [...galleryImageUrls, ...newGalleryUrls];
    }

    if (provider) {
      provider.name = name || provider.name;
      provider.garageName = garageName || provider.garageName;
      provider.email = email || provider.email;
      if (profileImageUrl) provider.profileImage = profileImageUrl;
      if (galleryImageUrls.length > 0) provider.galleryImages = galleryImageUrls;
      if (parsedAddress) provider.address = { ...provider.address?.toObject?.() || provider.address, ...parsedAddress };
      
      if (experienceYears !== undefined && experienceYears !== "") provider.experienceYears = Number(experienceYears);
      if (startingPrice !== undefined && startingPrice !== "") provider.startingPrice = Number(startingPrice);
      if (serviceArea !== undefined) provider.serviceArea = serviceArea;
      if (operatorName !== undefined) provider.operatorName = operatorName;
      if (licenseNumber !== undefined) provider.licenseNumber = licenseNumber;
      if (tagline !== undefined) provider.tagline = tagline;
      if (about !== undefined) provider.about = about;
      if (availabilitySummary !== undefined) provider.availabilitySummary = availabilitySummary;
      
      // Update arrays if provided
      if (Array.isArray(parsedServices)) provider.servicesOffered = parsedServices;
      if (Array.isArray(parsedVehicles)) provider.vehiclesRecoveredTypes = parsedVehicles;

      provider.otp = otp;
      provider.otpExpiry = otpExpiry;
      provider.isMobileVerified = false;

      await provider.save();
    } else {
      provider = await RecoveryVehicleUser.create({
        name,
        garageName,
        phone,
        email,
        profileImage: profileImageUrl,
        galleryImages: galleryImageUrls,
        address: parsedAddress || {},
        experienceYears: experienceYears ? Number(experienceYears) : 0,
        startingPrice: startingPrice ? Number(startingPrice) : 899,
        serviceArea: serviceArea || "",
        operatorName: operatorName || name,
        licenseNumber: licenseNumber || "",
        tagline: tagline || "Fast | Safe | Reliable",
        about: about || "",
        availabilitySummary: availabilitySummary || "24x7 (All Days)",
        servicesOffered: Array.isArray(parsedServices) ? parsedServices : ["Breakdown Recovery", "Accident Recovery", "Bike Recovery", "Jump Start Service", "Fuel Delivery"],
        vehiclesRecoveredTypes: Array.isArray(parsedVehicles) ? parsedVehicles : ["Hatchback", "Sedan", "SUV", "MPV", "Luxury Cars", "Commercial"],
        otp,
        otpExpiry,
        isMobileVerified: false
      });
    }

    try {
      await sendDltMessage(phone, otp);
    } catch (smsErr) {
      console.error("SMS sending failed:", smsErr);
    }

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
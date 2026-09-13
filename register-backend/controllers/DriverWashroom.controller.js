// controllers/DriverWashroom.controller.js
const fs = require("fs");
const path = require("path");
const DriverWashroom = require("../models/DriverWashroom.model");

const base_url = "https://partners.taxisafar.com"; // adjust to your actual base

const fileUrl = (filename) =>
  filename ? `${base_url}/uploads/washrooms/${filename}` : null;

const safeUnlink = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.error("unlink err:", err);
  });
};

// ── DRIVER: create listing (goes to pending) ──
exports.createWashroom = async (req, res) => {
  try {
    const driverId = req.driver?._id || req.body.driverId; // adjust per your auth middleware
    if (!driverId) {
      return res.status(401).json({ success: false, data: null, message: "Driver auth required" });
    }

    const {
      name,
      address,
      latitude,
      longitude,
      googleMapLink,
      contactNumber,
      description,
      facilities,
      isVisibleToggle,
    } = req.body;

    if (!name || !address || !description) {
      return res.status(400).json({ success: false, data: null, message: "Name, address, and description are required" });
    }

    const photoFiles = req.files?.photos || [];
    if (photoFiles.length < 3 || photoFiles.length > 5) {
      return res.status(400).json({ success: false, data: null, message: "Please upload between 3 and 5 photos" });
    }

    let facilitiesArr = facilities;
    if (typeof facilitiesArr === "string") {
      try {
        facilitiesArr = JSON.parse(facilitiesArr);
      } catch (_) {
        facilitiesArr = facilitiesArr.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const washroom = await DriverWashroom.create({
      name,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
      googleMapLink,
      contactNumber,
      description,
      photos: photoFiles.map((f) => fileUrl(f.filename)),
      facilities: facilitiesArr || [],
      isVisibleToggle: isVisibleToggle === "false" ? false : true,
      submittedBy: driverId,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      data: washroom,
      message: "Listing submitted. It will be visible after admin approval.",
    });
  } catch (err) {
    console.error("createWashroom err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to create listing" });
  }
};

// ── DRIVER: get my listings (all statuses) ──
exports.getMyWashrooms = async (req, res) => {
  try {
    const driverId = req.driver?._id || req.params.driverId;
    const { page = 1, limit = 20, status } = req.query;

    const query = { submittedBy: driverId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      DriverWashroom.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      DriverWashroom.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "My listings fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getMyWashrooms err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch listings" });
  }
};

// ── PUBLIC / APP: get only approved + visible listings ──
exports.getPublicWashrooms = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, lat, lng, radiusKm = 25 } = req.query;

    const query = { isLive: true };
    if (search) query.$text = { $search: search };

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radiusKm) * 1000,
        },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      DriverWashroom.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      DriverWashroom.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "Washrooms fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getPublicWashrooms err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch washrooms" });
  }
};

// ── PUBLIC / APP: get one (only if live, unless owner) ──
exports.getOneWashroom = async (req, res) => {
  try {
    const washroom = await DriverWashroom.findById(req.params.id);
    if (!washroom) return res.status(404).json({ success: false, data: null, message: "Not found" });

    const driverId = req.driver?._id?.toString();
    const isOwner = driverId && washroom.submittedBy.toString() === driverId;

    if (!washroom.isLive && !isOwner) {
      return res.status(404).json({ success: false, data: null, message: "Listing not available" });
    }

    return res.json({ success: true, data: washroom, message: "Washroom fetched" });
  } catch (err) {
    console.error("getOneWashroom err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch washroom" });
  }
};

exports.updateWashroom = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await DriverWashroom.findById(id);
    if (!existing) return res.status(404).json({ success: false, data: null, message: "Not found" });

    const body = { ...req.body };

    if (body.latitude || body.longitude) {
      body.location = {
        type: "Point",
        coordinates: [
          parseFloat(body.longitude) || existing.location.coordinates[0],
          parseFloat(body.latitude) || existing.location.coordinates[1],
        ],
      };
    }
    delete body.latitude;
    delete body.longitude;

    if (typeof body.facilities === "string") {
      try {
        body.facilities = JSON.parse(body.facilities);
      } catch (_) {
        body.facilities = body.facilities.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (typeof body.isVisibleToggle === "string") {
      body.isVisibleToggle = body.isVisibleToggle === "true";
    }

    if (req.files?.photos?.length) {
      existing.photos.forEach((url) => {
        const filename = path.basename(url);
        safeUnlink(path.join(__dirname, "..", "uploads", "washrooms", filename));
      });
      body.photos = req.files.photos.map((f) => fileUrl(f.filename));
    }

    // ── Admin edit vs Driver self-edit ──
    const isAdminEdit = body.isAdminEdit === "true" || body.isAdminEdit === true;
    delete body.isAdminEdit;

    if (isAdminEdit) {
      if (body.status === "approved") {
        body.reviewedBy = req.admin?._id || existing.reviewedBy;
        body.reviewedAt = new Date();
        body.rejectionReason = "";
      } else if (body.status === "rejected") {
        body.reviewedBy = req.admin?._id || existing.reviewedBy;
        body.reviewedAt = new Date();
        if (!body.rejectionReason) body.rejectionReason = existing.rejectionReason || "";
      }
    } else {
      body.status = "pending";
      body.reviewedBy = null;
      body.reviewedAt = null;
      body.rejectionReason = "";
    }

    // ── Recompute isLive manually since findByIdAndUpdate skips pre("save") ──
    const finalStatus = body.status !== undefined ? body.status : existing.status;
    const finalVisible = body.isVisibleToggle !== undefined ? body.isVisibleToggle : existing.isVisibleToggle;
    body.isLive = finalStatus === "approved" && finalVisible === true;

    const updated = await DriverWashroom.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    return res.json({
      success: true,
      data: updated,
      message: isAdminEdit ? "Listing updated successfully" : "Listing updated and sent for re-approval",
    });
  } catch (err) {
    console.error("updateWashroom err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to update listing" });
  }
};
// ── DRIVER: toggle own visibility (does not bypass admin approval) ──
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const washroom = await DriverWashroom.findById(id);
    if (!washroom) return res.status(404).json({ success: false, data: null, message: "Not found" });



    washroom.isVisibleToggle = !washroom.isVisibleToggle;
    await washroom.save(); // isLive recalculated in pre-save hook

    return res.json({ success: true, data: washroom, message: "Visibility updated" });
  } catch (err) {
    console.error("toggleVisibility err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to toggle visibility" });
  }
};

// ── DRIVER: delete own listing ──
exports.deleteWashroom = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driver?._id;

    const washroom = await DriverWashroom.findById(id);
    if (!washroom) return res.status(404).json({ success: false, data: null, message: "Not found" });

    if (driverId && washroom.submittedBy.toString() !== driverId.toString()) {
      return res.status(403).json({ success: false, data: null, message: "Not allowed" });
    }

    washroom.photos.forEach((url) => {
      const filename = path.basename(url);
      safeUnlink(path.join(__dirname, "..", "uploads", "washrooms", filename));
    });

    await washroom.deleteOne();

    return res.json({ success: true, data: null, message: "Listing deleted" });
  } catch (err) {
    console.error("deleteWashroom err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to delete listing" });
  }
};

// ══════════════════════════ ADMIN ══════════════════════════

// ── ADMIN: get all listings (any status, filterable) ──
exports.adminGetAllWashrooms = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      DriverWashroom.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DriverWashroom.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "Listings fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("adminGetAllWashrooms err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch listings" });
  }
};

// ── ADMIN: approve ──
exports.adminApproveWashroom = async (req, res) => {
  try {
    const { id } = req.params;

    const washroom = await DriverWashroom.findById(id);
    if (!washroom) return res.status(404).json({ success: false, data: null, message: "Listing not found" });

    washroom.status = "approved";
    washroom.rejectionReason = "";
    washroom.reviewedBy = req.admin?._id || null;
    washroom.reviewedAt = new Date();
    await washroom.save();

    return res.json({ success: true, data: washroom, message: "Listing approved and now live" });
  } catch (err) {
    console.error("adminApproveWashroom err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to approve listing" });
  }
};

// ── ADMIN: reject ──
exports.adminRejectWashroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const washroom = await DriverWashroom.findById(id);
    if (!washroom) return res.status(404).json({ success: false, data: null, message: "Listing not found" });

    washroom.status = "rejected";
    washroom.rejectionReason = reason || "Does not meet quality guidelines";
    washroom.reviewedBy = req.admin?._id || null;
    washroom.reviewedAt = new Date();
    await washroom.save();

    return res.json({ success: true, data: washroom, message: "Listing rejected" });
  } catch (err) {
    console.error("adminRejectWashroom err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to reject listing" });
  }
};

// ── ADMIN: delete any listing ──
exports.adminDeleteWashroom = async (req, res) => {
  try {
    const { id } = req.params;
    const washroom = await DriverWashroom.findById(id);
    if (!washroom) return res.status(404).json({ success: false, data: null, message: "Listing not found" });

    washroom.photos.forEach((url) => {
      const filename = path.basename(url);
      safeUnlink(path.join(__dirname, "..", "uploads", "washrooms", filename));
    });

    await washroom.deleteOne();

    return res.json({ success: true, data: null, message: "Listing deleted by admin" });
  } catch (err) {
    console.error("adminDeleteWashroom err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to delete listing" });
  }
};
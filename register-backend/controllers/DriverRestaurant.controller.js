// controllers/DriverRestaurant.controller.js
const fs = require("fs");
const path = require("path");
const DriverRestaurant = require("../models/DriverRestaurant.model");

const base_url = "https://partners.taxisafar.com"; // adjust to your actual base

const fileUrl = (filename) =>
  filename ? `${base_url}/uploads/restaurants/${filename}` : null;

const safeUnlink = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.error("unlink err:", err);
  });
};

// ── DRIVER: create listing (goes to pending) ──
exports.createRestaurant = async (req, res) => {
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
      foodType,
      customerAllowed,
      description,
      contactNumber,
      openTime,
      closeTime,
      facilities,
      googleMapLink,
      confirmedByDriver,
      isVisibleToggle,
    } = req.body;

    if (!name || !address || !description || !contactNumber || !googleMapLink) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Name, address, description, contact number, and Google Map link are required",
      });
    }

    if (!["free", "discount_paid"].includes(foodType)) {
      return res.status(400).json({ success: false, data: null, message: "Select a valid food type" });
    }

    if (!["customers_allowed", "only_drivers"].includes(customerAllowed)) {
      return res.status(400).json({ success: false, data: null, message: "Select a valid customer policy" });
    }

    if (!openTime || !closeTime) {
      return res.status(400).json({ success: false, data: null, message: "Restaurant timings are required" });
    }

    if (confirmedByDriver !== "true" && confirmedByDriver !== true) {
      return res.status(400).json({ success: false, data: null, message: "Please confirm the information is correct" });
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

    const restaurant = await DriverRestaurant.create({
      name,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
      },
      foodType,
      customerAllowed,
      description,
      contactNumber,
      timings: { openTime, closeTime },
      facilities: facilitiesArr || [],
      photos: photoFiles.map((f) => fileUrl(f.filename)),
      googleMapLink,
      confirmedByDriver: true,
      isVisibleToggle: isVisibleToggle === "false" ? false : true,
      submittedBy: driverId,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      data: restaurant,
      message: "Restaurant submitted for review. It will be live after admin approval.",
    });
  } catch (err) {
    console.error("createRestaurant err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to create listing" });
  }
};

// ── DRIVER: get my listings (all statuses) ──
exports.getMyRestaurants = async (req, res) => {
  try {
    const driverId = req.driver?._id || req.params.driverId;
    const { page = 1, limit = 20, status } = req.query;

    const query = { submittedBy: driverId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      DriverRestaurant.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      DriverRestaurant.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "My listings fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getMyRestaurants err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch listings" });
  }
};

// ── PUBLIC / APP: get only approved + visible listings ──
exports.getPublicRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, lat, lng, radiusKm = 25, foodType, customerAllowed } = req.query;

    const query = { isLive: true };
    if (search) query.$text = { $search: search };
    if (foodType) query.foodType = foodType;
    if (customerAllowed) query.customerAllowed = customerAllowed;

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
      DriverRestaurant.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      DriverRestaurant.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "Restaurants fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getPublicRestaurants err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch restaurants" });
  }
};

// ── PUBLIC / APP: get one (only if live, unless owner) ──
exports.getOneRestaurant = async (req, res) => {
  try {
    const restaurant = await DriverRestaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, data: null, message: "Not found" });

    const driverId = req.driver?._id?.toString();
    const isOwner = driverId && restaurant.submittedBy.toString() === driverId;

    if (!restaurant.isLive && !isOwner) {
      return res.status(404).json({ success: false, data: null, message: "Listing not available" });
    }

    return res.json({ success: true, data: restaurant, message: "Restaurant fetched" });
  } catch (err) {
    console.error("getOneRestaurant err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch restaurant" });
  }
};

// ── DRIVER: update own listing (re-submits to pending) ──
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driver?._id;

    const existing = await DriverRestaurant.findById(id);
    if (!existing) return res.status(404).json({ success: false, data: null, message: "Not found" });

    if (driverId && existing.submittedBy.toString() !== driverId.toString()) {
      return res.status(403).json({ success: false, data: null, message: "Not allowed" });
    }

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

    if (body.openTime || body.closeTime) {
      body.timings = {
        openTime: body.openTime || existing.timings.openTime,
        closeTime: body.closeTime || existing.timings.closeTime,
      };
    }

    if (typeof body.facilities === "string") {
      try {
        body.facilities = JSON.parse(body.facilities);
      } catch (_) {
        body.facilities = body.facilities.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (req.files?.photos?.length) {
      existing.photos.forEach((url) => {
        const filename = path.basename(url);
        safeUnlink(path.join(__dirname, "..", "uploads", "restaurants", filename));
      });
      body.photos = req.files.photos.map((f) => fileUrl(f.filename));
    }

    // any content edit sends it back for re-approval
    body.status = "pending";
    body.reviewedBy = null;
    body.reviewedAt = null;
    body.rejectionReason = "";

    const updated = await DriverRestaurant.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    return res.json({ success: true, data: updated, message: "Listing updated and sent for re-approval" });
  } catch (err) {
    console.error("updateRestaurant err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to update listing" });
  }
};

// ── DRIVER: toggle own visibility ──
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driver?._id;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant) return res.status(404).json({ success: false, data: null, message: "Not found" });

    if (driverId && restaurant.submittedBy.toString() !== driverId.toString()) {
      return res.status(403).json({ success: false, data: null, message: "Not allowed" });
    }

    restaurant.isVisibleToggle = !restaurant.isVisibleToggle;
    await restaurant.save();

    return res.json({ success: true, data: restaurant, message: "Visibility updated" });
  } catch (err) {
    console.error("toggleVisibility err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to toggle visibility" });
  }
};

// ── DRIVER: delete own listing ──
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driver?._id;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant) return res.status(404).json({ success: false, data: null, message: "Not found" });

    if (driverId && restaurant.submittedBy.toString() !== driverId.toString()) {
      return res.status(403).json({ success: false, data: null, message: "Not allowed" });
    }

    restaurant.photos.forEach((url) => {
      const filename = path.basename(url);
      safeUnlink(path.join(__dirname, "..", "uploads", "restaurants", filename));
    });

    await restaurant.deleteOne();

    return res.json({ success: true, data: null, message: "Listing deleted" });
  } catch (err) {
    console.error("deleteRestaurant err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to delete listing" });
  }
};

// ══════════════════════════ ADMIN ══════════════════════════

// ── ADMIN: get all listings (any status, filterable) ──
exports.adminGetAllRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      DriverRestaurant.find(query)
  
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DriverRestaurant.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "Listings fetched",
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("adminGetAllRestaurants err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to fetch listings" });
  }
};

// ── ADMIN: approve ──
exports.adminApproveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant) return res.status(404).json({ success: false, data: null, message: "Listing not found" });

    restaurant.status = "approved";
    restaurant.rejectionReason = "";
    restaurant.reviewedBy = req.admin?._id || null;
    restaurant.reviewedAt = new Date();
    await restaurant.save();

    return res.json({ success: true, data: restaurant, message: "Listing approved and now live" });
  } catch (err) {
    console.error("adminApproveRestaurant err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to approve listing" });
  }
};

// ── ADMIN: reject ──
exports.adminRejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant) return res.status(404).json({ success: false, data: null, message: "Listing not found" });

    restaurant.status = "rejected";
    restaurant.rejectionReason = reason || "Does not meet quality guidelines";
    restaurant.reviewedBy = req.admin?._id || null;
    restaurant.reviewedAt = new Date();
    await restaurant.save();

    return res.json({ success: true, data: restaurant, message: "Listing rejected" });
  } catch (err) {
    console.error("adminRejectRestaurant err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to reject listing" });
  }
};

// ── ADMIN: delete any listing ──
exports.adminDeleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant) return res.status(404).json({ success: false, data: null, message: "Listing not found" });

    restaurant.photos.forEach((url) => {
      const filename = path.basename(url);
      safeUnlink(path.join(__dirname, "..", "uploads", "restaurants", filename));
    });

    await restaurant.deleteOne();

    return res.json({ success: true, data: null, message: "Listing deleted by admin" });
  } catch (err) {
    console.error("adminDeleteRestaurant err:", err);
    return res.status(500).json({ success: false, data: null, message: err.message || "Failed to delete listing" });
  }
};
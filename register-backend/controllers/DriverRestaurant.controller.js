// controllers/DriverRestaurant.controller.js
const fs = require("fs");
const path = require("path");
const DriverRestaurant = require("../models/DriverRestaurant.model");
const mongoose = require("mongoose");
const base_url = "https://partners.taxisafar.com"; // adjust to your actual base

const fileUrl = (filename) =>
  filename ? `${base_url}/uploads/restaurants/${filename}` : null;

const safeUnlink = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.error("unlink err:", err);
  });
};

const PHONE_RE = /^[0-9+\-\s]{7,15}$/;

const parseContacts = (raw) => {
  let arr = raw;
  if (typeof arr === "string") {
    try {
      arr = JSON.parse(arr);
    } catch {
      return { error: "Invalid contacts format" };
    }
  }
  if (arr == null) return { contacts: [] };
  if (!Array.isArray(arr)) return { error: "Contacts must be an array" };

  const contacts = arr
    .map((c) => ({
      role: String(c?.role || "").trim(),
      name: String(c?.name || "").trim(),
      number: String(c?.number || "").trim(),
    }))
    .filter((c) => c.role || c.name || c.number);

  if (contacts.length > 4) return { error: "Maximum 4 contacts allowed" };
  for (const c of contacts) {
    if (!c.role || !c.number)
      return { error: "Each contact needs a Role/Person and a Number" };
    if (!PHONE_RE.test(c.number))
      return { error: `Invalid number: ${c.number}` };
  }
  return { contacts };
};

// accepts "HH:mm" (24h) and "hh:mm AM/PM" (12h)
const TIME_RE =
  /^(([01]\d|2[0-3]):[0-5]\d|(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM))$/i;

exports.createRestaurant = async (req, res) => {
  try {
    const driverId = req.driver?._id || req.body.driverId;

    if (!driverId) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Driver auth required",
      });
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
      contacts: rawContacts,
      openTime,
      closeTime,
      is24Hours,
      facilities,
      googleMapLink,
      confirmedByDriver,
      isVisibleToggle,
    } = req.body;

    const isOpen24Hours =
      is24Hours === true || is24Hours === "true" || is24Hours === "1";

    if (
      !name?.trim() ||
      !address?.trim() ||
      !description?.trim() ||
      !contactNumber?.trim() ||
      !googleMapLink?.trim()
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        message:
          "Name, address, description, contact number, and Google Map link are required",
      });
    }

    if (!["free", "discount_paid"].includes(foodType)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Select a valid food type",
      });
    }

    if (!["customers_allowed", "only_drivers"].includes(customerAllowed)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Select a valid customer policy",
      });
    }

    // Timings are required only when restaurant is not open 24/7
    if (!isOpen24Hours) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

      if (
        !openTime ||
        !closeTime ||
        !timeRegex.test(openTime) ||
        !timeRegex.test(closeTime)
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          message:
            "Valid opening and closing times are required in HH:mm format",
        });
      }
    }

    if (confirmedByDriver !== "true" && confirmedByDriver !== true) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Please confirm the information is correct",
      });
    }
    const { contacts: parsedContacts, error: contactErr } =
      parseContacts(rawContacts);
    if (contactErr)
      return res
        .status(400)
        .json({ success: false, data: null, message: contactErr });

    let finalContacts = parsedContacts;
    if (!finalContacts.length && contactNumber?.trim()) {
      finalContacts = [
        { role: "Owner", name: "", number: contactNumber.trim() },
      ]; // old app fallback
    }
    if (!finalContacts.length)
      return res.status(400).json({
        success: false,
        data: null,
        message: "At least one contact is required",
      });
    const photoFiles = req.files?.photos || [];

    if (photoFiles.length < 3 || photoFiles.length > 5) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Please upload between 3 and 5 photos",
      });
    }

    let facilitiesArr = facilities;

    if (typeof facilitiesArr === "string") {
      try {
        facilitiesArr = JSON.parse(facilitiesArr);
      } catch {
        facilitiesArr = facilitiesArr
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    if (facilitiesArr == null) {
      facilitiesArr = [];
    }

    if (!Array.isArray(facilitiesArr)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Facilities must be an array",
      });
    }

    const restaurant = await DriverRestaurant.create({
      name: name.trim(),
      address: address.trim(),

      location: {
        type: "Point",
        coordinates: [
          Number.isFinite(Number(longitude)) ? Number(longitude) : 0,
          Number.isFinite(Number(latitude)) ? Number(latitude) : 0,
        ],
      },

      foodType,
      customerAllowed,
      description: description.trim(),
      contacts: finalContacts,
      contactNumber: finalContacts[0].number,
      is24Hours: isOpen24Hours,

      timings: isOpen24Hours
        ? { openTime: "00:00", closeTime: "23:59" }
        : { openTime, closeTime },

      facilities: facilitiesArr,
      photos: photoFiles.map((file) => fileUrl(file.filename)),
      googleMapLink: googleMapLink.trim(),
      confirmedByDriver: true,
      isVisibleToggle: isVisibleToggle === "false" ? false : true,
      submittedBy: driverId,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      data: restaurant,
      message:
        "Restaurant submitted for review. It will be live after admin approval.",
    });
  } catch (err) {
    console.error("createRestaurant error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        data: null,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to create listing",
    });
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
      DriverRestaurant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DriverRestaurant.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "My listings fetched",
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getMyRestaurants err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to fetch listings",
    });
  }
};

// ── PUBLIC / APP: get only approved + visible listings ──
exports.getPublicRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      lat,
      lng,
      radiusKm = 25,
      foodType,
      customerAllowed,
    } = req.query;

    const query = { isLive: true };
    if (search) query.$text = { $search: search };
    if (foodType) query.foodType = foodType;
    if (customerAllowed) query.customerAllowed = customerAllowed;

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radiusKm) * 1000,
        },
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      DriverRestaurant.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      DriverRestaurant.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      message: "Restaurants fetched",
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getPublicRestaurants err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to fetch restaurants",
    });
  }
};

// ── PUBLIC / APP: get one (only if live, unless owner) ──
exports.getOneRestaurant = async (req, res) => {
  try {
    const restaurant = await DriverRestaurant.findById(req.params.id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Not found" });

    const driverId = req.driver?._id?.toString();
    const isOwner = driverId && restaurant.submittedBy.toString() === driverId;

    if (!restaurant.isLive && !isOwner) {
      return res
        .status(404)
        .json({ success: false, data: null, message: "Listing not available" });
    }

    return res.json({
      success: true,
      data: restaurant,
      message: "Restaurant fetched",
    });
  } catch (err) {
    console.error("getOneRestaurant err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to fetch restaurant",
    });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driver?._id || req.body.submittedBy;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid restaurant ID",
      });
    }

    if (!driverId) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Driver auth required",
      });
    }

    const existing = await DriverRestaurant.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Restaurant not found",
      });
    }

    if (existing.submittedBy.toString() !== driverId.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "You can only update your own listing",
      });
    }

    const body = { ...req.body };

    // Never allow clients to change ownership or admin review fields.
    delete body._id;
    delete body.submittedBy;
    delete body.status;
    delete body.reviewedBy;
    delete body.reviewedAt;
    delete body.rejectionReason;
    delete body.isLive;

    // Parse 24-hour flag
    const isOpen24Hours =
      body.is24Hours !== undefined
        ? body.is24Hours === true ||
          body.is24Hours === "true" ||
          body.is24Hours === "1"
        : existing.is24Hours === true;

    body.is24Hours = isOpen24Hours;

    // Update location when coordinates are supplied
    if (body.latitude !== undefined || body.longitude !== undefined) {
      const currentCoordinates = existing.location?.coordinates || [0, 0];

      const longitude =
        body.longitude !== undefined && body.longitude !== ""
          ? Number(body.longitude)
          : currentCoordinates[0];

      const latitude =
        body.latitude !== undefined && body.latitude !== ""
          ? Number(body.latitude)
          : currentCoordinates[1];

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Invalid latitude or longitude",
        });
      }

      body.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }
    if (body.contacts !== undefined) {
      const { contacts, error } = parseContacts(body.contacts);
      if (error)
        return res
          .status(400)
          .json({ success: false, data: null, message: error });
      if (!contacts.length)
        return res
          .status(400)
          .json({
            success: false,
            data: null,
            message: "At least one contact is required",
          });
      body.contacts = contacts;
      body.contactNumber = contacts[0].number; // findByIdAndUpdate skips pre-hooks
    }
    delete body.latitude;
    delete body.longitude;

    // Handle restaurant timings
    const nextOpenTime =
      body.openTime !== undefined ? body.openTime : existing.timings?.openTime;

    const nextCloseTime =
      body.closeTime !== undefined
        ? body.closeTime
        : existing.timings?.closeTime;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (isOpen24Hours) {
      body.timings = {
        openTime: "00:00",
        closeTime: "23:59",
      };
    } else {
      if (
        !nextOpenTime ||
        !nextCloseTime ||
        !timeRegex.test(nextOpenTime) ||
        !timeRegex.test(nextCloseTime)
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          message:
            "Valid opening and closing times are required in HH:mm format",
        });
      }

      body.timings = {
        openTime: nextOpenTime,
        closeTime: nextCloseTime,
      };
    }

    delete body.openTime;
    delete body.closeTime;

    // Parse facilities
    if (typeof body.facilities === "string") {
      try {
        body.facilities = JSON.parse(body.facilities);
      } catch {
        body.facilities = body.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    if (body.facilities !== undefined && !Array.isArray(body.facilities)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Facilities must be an array",
      });
    }

    // Replace photos only when new photos are uploaded
    if (req.files?.photos?.length) {
      const newPhotos = req.files.photos;

      if (newPhotos.length < 3 || newPhotos.length > 5) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Please upload between 3 and 5 photos",
        });
      }

      body.photos = newPhotos.map((file) => fileUrl(file.filename));
    }

    // Any content edit sends listing back for admin review
    body.status = "pending";
    body.reviewedBy = null;
    body.reviewedAt = null;
    body.rejectionReason = "";
    body.isLive = false;

    const updated = await DriverRestaurant.findByIdAndUpdate(
      id,
      { $set: body },
      {
        new: true,
        runValidators: true,
      },
    );

    // Remove old photo files only after a successful update
    if (req.files?.photos?.length) {
      existing.photos.forEach((url) => {
        const filename = path.basename(url);

        safeUnlink(
          path.join(__dirname, "..", "uploads", "restaurants", filename),
        );
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Listing updated and sent for re-approval",
    });
  } catch (err) {
    console.error("updateRestaurant error:", err);

    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to update listing",
    });
  }
};

// ── DRIVER: toggle own visibility ──
exports.toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driver?._id;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Not found" });

    if (driverId && restaurant.submittedBy.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json({ success: false, data: null, message: "Not allowed" });
    }

    restaurant.isVisibleToggle = !restaurant.isVisibleToggle;
    await restaurant.save();

    return res.json({
      success: true,
      data: restaurant,
      message: "Visibility updated",
    });
  } catch (err) {
    console.error("toggleVisibility err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to toggle visibility",
    });
  }
};

// ── DRIVER: delete own listing ──
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.driver?._id;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Not found" });

    if (driverId && restaurant.submittedBy.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json({ success: false, data: null, message: "Not allowed" });
    }

    restaurant.photos.forEach((url) => {
      const filename = path.basename(url);
      safeUnlink(
        path.join(__dirname, "..", "uploads", "restaurants", filename),
      );
    });

    await restaurant.deleteOne();

    return res.json({ success: true, data: null, message: "Listing deleted" });
  } catch (err) {
    console.error("deleteRestaurant err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to delete listing",
    });
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
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("adminGetAllRestaurants err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to fetch listings",
    });
  }
};

// ── ADMIN: approve ──
exports.adminApproveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Listing not found" });

    restaurant.status = "approved";
    restaurant.rejectionReason = "";
    restaurant.reviewedBy = req.admin?._id || null;
    restaurant.reviewedAt = new Date();
    await restaurant.save();

    return res.json({
      success: true,
      data: restaurant,
      message: "Listing approved and now live",
    });
  } catch (err) {
    console.error("adminApproveRestaurant err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to approve listing",
    });
  }
};

// ── ADMIN: reject ──
exports.adminRejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Listing not found" });

    restaurant.status = "rejected";
    restaurant.rejectionReason = reason || "Does not meet quality guidelines";
    restaurant.reviewedBy = req.admin?._id || null;
    restaurant.reviewedAt = new Date();
    await restaurant.save();

    return res.json({
      success: true,
      data: restaurant,
      message: "Listing rejected",
    });
  } catch (err) {
    console.error("adminRejectRestaurant err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to reject listing",
    });
  }
};

// ── ADMIN: delete any listing ──
exports.adminDeleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await DriverRestaurant.findById(id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, data: null, message: "Listing not found" });

    restaurant.photos.forEach((url) => {
      const filename = path.basename(url);
      safeUnlink(
        path.join(__dirname, "..", "uploads", "restaurants", filename),
      );
    });

    await restaurant.deleteOne();

    return res.json({
      success: true,
      data: null,
      message: "Listing deleted by admin",
    });
  } catch (err) {
    console.error("adminDeleteRestaurant err:", err);
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to delete listing",
    });
  }
};

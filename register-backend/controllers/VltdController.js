const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const VltdProduct = require("../models/VltdProduct");
const VltdPickupLocation = require("../models/VltdPickupLocation");
const VltdOrder = require("../models/VltdOrder");
const { sendVtldOrderPlaced } = require("../utils/sendWhatsapp");

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
   VLTD PRODUCT & PICKUP LOCATIONS CONTROLLERS
====================================================== */





// --- CREATE PICKUP LOCATION ---
exports.createPickupLocation = async (req, res) => {
    try {
        const {
            state,
            city,
            hubName,
            fullAddress,
            contactPerson,
            contactPhone,
            isActive
        } = req.body;

        // Required field validation
        if (!state || !city || !hubName || !fullAddress) {
            return res.status(400).json({
                success: false,
                message: "state, city, hubName and fullAddress are required"
            });
        }

        const location = await VltdPickupLocation.create({
            state: state.trim(),
            city: city.trim(),
            hubName: hubName.trim(),
            fullAddress: fullAddress.trim(),
            contactPerson: contactPerson?.trim() || null,
            contactPhone: contactPhone?.trim() || null,
            isActive: typeof isActive === "boolean" ? isActive : true
        });

        return res.status(201).json({
            success: true,
            data: location,
            message: "Pickup location created successfully"
        });

    } catch (err) {
        console.error("createPickupLocation err:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create pickup location"
        });
    }
};


// --- UPDATE PICKUP LOCATION ---
exports.updatePickupLocation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pickup location ID"
            });
        }

        const {
            state,
            city,
            hubName,
            fullAddress,
            contactPerson,
            contactPhone,
            isActive
        } = req.body;

        const updateData = {};

        if (state !== undefined) {
            updateData.state = state.trim();
        }

        if (city !== undefined) {
            updateData.city = city.trim();
        }

        if (hubName !== undefined) {
            updateData.hubName = hubName.trim();
        }

        if (fullAddress !== undefined) {
            updateData.fullAddress = fullAddress.trim();
        }

        if (contactPerson !== undefined) {
            updateData.contactPerson = contactPerson?.trim() || null;
        }

        if (contactPhone !== undefined) {
            updateData.contactPhone = contactPhone?.trim() || null;
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        const location = await VltdPickupLocation.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        );

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Pickup location not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: location,
            message: "Pickup location updated successfully"
        });

    } catch (err) {
        console.error("updatePickupLocation err:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to update pickup location"
        });
    }
};
// --- GET ALL PICKUP LOCATIONS ---
exports.getAllPickupLocations = async (req, res) => {
    try {
        const locations = await VltdPickupLocation
            .find({})
            .sort({ state: 1, city: 1 });

        return res.status(200).json({
            success: true,
            data: locations,
            message: "All pickup locations fetched successfully"
        });

    } catch (err) {
        console.error("getAllPickupLocations err:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch pickup locations"
        });
    }
};

// --- DELETE PICKUP LOCATION ---
exports.deletePickupLocation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pickup location ID"
            });
        }

        const location = await VltdPickupLocation.findByIdAndDelete(id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Pickup location not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: location,
            message: "Pickup location deleted successfully"
        });

    } catch (err) {
        console.error("deletePickupLocation err:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to delete pickup location"
        });
    }
};

// --- GET VLTD PRODUCT DETAILS ---
exports.getVltdProduct = async (req, res) => {
    try {
        const product = await VltdProduct.findOne({ isActive: true });
        if (!product) {
            return res.status(404).json({ success: false, message: "VLTD product configuration not found." });
        }
        return res.status(200).json({ success: true, data: product, message: "VLTD product fetched successfully" });
    } catch (err) {
        console.error("getVltdProduct err:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to fetch VLTD product" });
    }
};

// --- GET PICKUP LOCATIONS BY STATE ---
exports.getPickupLocationsByState = async (req, res) => {
    try {
        const { state } = req.query;
        const query = { isActive: true };
        if (state) {
            query.state = new RegExp(`^${state}$`, "i");
        }

        const locations = await VltdPickupLocation.find(query).sort({ city: 1 });
        return res.status(200).json({ success: true, data: locations, message: "Pickup locations fetched successfully" });
    } catch (err) {
        console.error("getPickupLocationsByState err:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to fetch pickup locations" });
    }
};

/* ======================================================
   VLTD ORDER CONTROLLERS
====================================================== */

// --- CREATE NEW VLTD ORDER (With Payment Proof Upload) ---
exports.createVltdOrder = async (req, res) => {
    try {
        const {
            userId,
            state,
            pickupLocation,
            vehicleNumber,
            deliveryMethod,
            courierAddress,
            userName,
            mobileNumber,
            rechargePlan,
            paymentSummary
        } = req.body;

        if (!userId || !state || !vehicleNumber || !userName || !mobileNumber || !deliveryMethod) {
            return res.status(400).json({ success: false, message: "All required fields must be filled." });
        }

        if (!["pickup", "courier"].includes(deliveryMethod)) {
            return res.status(400).json({ success: false, message: "Invalid delivery method." });
        }

        if (deliveryMethod === "pickup" && !pickupLocation) {
            return res.status(400).json({ success: false, message: "Pickup location is required." });
        }

        if (!isValidId(userId) || (deliveryMethod === "pickup" && !isValidId(pickupLocation))) {
            return res.status(400).json({ success: false, message: "Invalid User ID or Pickup Location ID format." });
        }

        if (deliveryMethod === "courier" && !courierAddress?.trim()) {
            return res.status(400).json({ success: false, message: "Courier address is required." });
        }

        // Handle Payment Proof File Upload (Screenshot/PDF)
        let paymentProofUrl = "";
        if (req.files && req.files.paymentProof && req.files.paymentProof[0]) {
            paymentProofUrl = fileUrl(req, req.files.paymentProof[0].filename);
        } else if (req.file) {
            paymentProofUrl = fileUrl(req, req.file.filename);
        }

        if (!paymentProofUrl) {
            return res.status(400).json({ success: false, message: "Payment proof screenshot or PDF is required." });
        }

        // Parse nested objects if sent as string from client FormData
        let parsedPlan = rechargePlan;
        if (typeof rechargePlan === "string") {
            try { parsedPlan = JSON.parse(rechargePlan); } catch (e) { parsedPlan = {}; }
        }

        let parsedSummary = paymentSummary;
        if (typeof paymentSummary === "string") {
            try { parsedSummary = JSON.parse(paymentSummary); } catch (e) { parsedSummary = {}; }
        }

        // Fetch pickup location details (only needed for pickup)
        let hubName = "TaxiSafar Hub";
        if (deliveryMethod === "pickup") {
            const pickupLocationDoc = await VltdPickupLocation.findById(pickupLocation);
            hubName = pickupLocationDoc ? pickupLocationDoc.hubName : hubName;
        }

        const newOrder = await VltdOrder.create({
            userId,
            state,
            ...(deliveryMethod === "pickup" && { pickupLocation }),
            vehicleNumber: vehicleNumber.toUpperCase(),
            userName,
            ...(deliveryMethod === "courier" && { courierAddress: courierAddress.trim() }),
            mobileNumber,
            rechargePlan: parsedPlan || {},
            paymentSummary: parsedSummary || {},
            paymentProofUrl,
            orderStatus: "pending_verification"
        });

        // Trigger WhatsApp Notification safely using parsed data
        try {
            await sendVtldOrderPlaced(
                mobileNumber,
                userName,
                vehicleNumber.toUpperCase(),
                parsedPlan.planTitle || "Recharge",
                deliveryMethod === "pickup" ? hubName : "Courier Delivery",
                parsedSummary.totalAmount || 0,
                newOrder._id
            );
        } catch (waErr) {
            console.error("WhatsApp trigger failed:", waErr);
        }

        return res.status(201).json({
            success: true,
            message: "VLTD order submitted successfully and is pending verification.",
            data: newOrder
        });

    } catch (err) {
        console.error("createVltdOrder err:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to create VLTD order" });
    }
};
// --- GET ORDERS FOR A SPECIFIC USER ---
exports.getUserVltdOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!isValidId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }

        const orders = await VltdOrder.find({ userId })
            .populate("pickupLocation")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: orders,
            message: "User VLTD orders fetched successfully"
        });
    } catch (err) {
        console.error("getUserVltdOrders err:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to fetch orders" });
    }
};

// --- ADMIN: GET ALL VLTD ORDERS ---
exports.adminGetAllVltdOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};
        if (status) query.orderStatus = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [orders, total] = await Promise.all([
            VltdOrder.find(query)
                .populate("pickupLocation")
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            VltdOrder.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            message: "All VLTD orders fetched successfully for admin"
        });
    } catch (err) {
        console.error("adminGetAllVltdOrders err:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to fetch orders" });
    }
};
exports.adminGetSingleVltdOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await VltdOrder.findById(id)
            .populate("pickupLocation");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "VLTD order not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
            message: "VLTD order fetched successfully for admin"
        });
    } catch (err) {
        console.error("adminGetSingleVltdOrder err:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch VLTD order"
        });
    }
};
// --- ADMIN: UPDATE ORDER STATUS ---
exports.adminUpdateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = ['pending_verification', 'verified', 'dispatched', 'completed', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ success: false, message: "Invalid order status value." });
        }

        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID." });
        }

        const order = await VltdOrder.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${orderStatus}`,
            data: order
        });
    } catch (err) {
        console.error("adminUpdateOrderStatus err:", err);
        return res.status(500).json({ success: false, message: err.message || "Failed to update order status" });
    }
};
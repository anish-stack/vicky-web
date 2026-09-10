"use strict";

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const PartnerConfig = require("../models/PartnerConfig");

// Helper to generate full URL from relative path
const fileUrl = (req, relativePath) => {
    const base_url = "https://partners.taxisafar.com";

    if (!relativePath) return null;

    // Already a complete URL
    if (
        relativePath.startsWith("http://") ||
        relativePath.startsWith("https://")
    ) {
        return relativePath;
    }

    // Make sure path starts with /
    const path = relativePath.startsWith("/")
        ? relativePath
        : `/${relativePath}`;

    return `${base_url}${path}`;
};

// Helper to safely delete local files
const safeUnlink = (filePath) => {
    if (!filePath) return;
    const absolutePath = path.join(__dirname, "..", filePath); // Adjust based on your folder structure if needed
    fs.unlink(absolutePath, (err) => {
        if (err && err.code !== "ENOENT") console.error("unlink err:", err);
    });
};

// ============================================================
// CREATE PARTNER CONFIG
// ============================================================
exports.createPartnerConfig = async (req, res) => {
    try {
        const { partner_screen_name, code_to_copy } = req.body;

        if (!partner_screen_name) {
            return res.status(400).json({
                success: false,
                message: "partner_screen_name is required"
            });
        }

        const existingConfig = await PartnerConfig.findOne({
            partner_screen_name: partner_screen_name.trim()
        });

        if (existingConfig) {
            // Clean up uploaded files if validation fails
            if (req.files?.audio) safeUnlink(req.files.audio[0].path);
            if (req.files?.image) safeUnlink(req.files.image[0].path);

            return res.status(409).json({
                success: false,
                message: "Partner config with this screen name already exists"
            });
        }

        // Extract relative paths from uploaded files
        let audioUrl = null;
        let image_url = null;

        if (req.files) {
            if (req.files.audio && req.files.audio[0]) {
                audioUrl = `/uploads/config/audio/${req.files.audio[0].filename}`;
            }
            if (req.files.image && req.files.image[0]) {
                image_url = `/uploads/config/image/${req.files.image[0].filename}`;
            }
        }

        const config = await PartnerConfig.create({
            partner_screen_name: partner_screen_name.trim(),
            audioUrl: audioUrl,
            image_url: image_url,
            code_to_copy: code_to_copy?.trim() || null
        });

        // Format response with full URLs
        const responseData = config.toObject();
        responseData.audioUrl = fileUrl(req, responseData.audioUrl);
        responseData.image_url = fileUrl(req, responseData.image_url);

        return res.status(201).json({
            success: true,
            data: responseData,
            message: "Partner config created successfully"
        });

    } catch (err) {
        console.error("createPartnerConfig error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create partner config"
        });
    }
};

// ============================================================
// GET ALL PARTNER CONFIGS
// ============================================================
exports.getAllPartnerConfigs = async (req, res) => {
    try {
        const configs = await PartnerConfig.find({}).sort({ createdAt: -1 });

        const formattedConfigs = configs.map(config => {
            const item = config.toObject();
            item.audioUrl = fileUrl(req, item.audioUrl);
            item.image_url = fileUrl(req, item.image_url);
            return item;
        });

        return res.status(200).json({
            success: true,
            data: formattedConfigs,
            count: formattedConfigs.length,
            message: "Partner configs fetched successfully"
        });

    } catch (err) {
        console.error("getAllPartnerConfigs error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch partner configs"
        });
    }
};

// ============================================================
// GET PARTNER CONFIG BY SCREEN NAME
// ============================================================
exports.getPartnerConfigByScreen = async (req, res) => {
    try {
        const { screenName } = req.params;

        if (!screenName) {
            return res.status(400).json({
                success: false,
                message: "screenName is required"
            });
        }

        const config = await PartnerConfig.findOne({
            partner_screen_name: new RegExp(
                `^${screenName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                "i"
            )
        });

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Partner config not found"
            });
        }

        const responseData = config.toObject();
        responseData.audioUrl = fileUrl(req, responseData.audioUrl);
        responseData.image_url = fileUrl(req, responseData.image_url);

        return res.status(200).json({
            success: true,
            data: responseData,
            message: "Partner config fetched successfully"
        });

    } catch (err) {
        console.error("getPartnerConfigByScreen error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch partner config"
        });
    }
};

// ============================================================
// UPDATE PARTNER CONFIG
// ============================================================
exports.updatePartnerConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partner config ID"
            });
        }

        const existingConfig = await PartnerConfig.findById(id);
        if (!existingConfig) {
            return res.status(404).json({
                success: false,
                message: "Partner config not found"
            });
        }

        const { partner_screen_name, code_to_copy } = req.body;
        const updateData = {};

        if (partner_screen_name !== undefined) {
            updateData.partner_screen_name = partner_screen_name.trim();
        }

        if (code_to_copy !== undefined) {
            updateData.code_to_copy = code_to_copy?.trim() || null;
        }

        // Handle File Updates
        if (req.files) {
            if (req.files.audio && req.files.audio[0]) {
                // Delete old audio if exists
                if (existingConfig.audioUrl) safeUnlink(existingConfig.audioUrl);
                updateData.audioUrl = `/uploads/config/audio/${req.files.audio[0].filename}`;
            }
            if (req.files.image && req.files.image[0]) {
                // Delete old image if exists
                if (existingConfig.image_url) safeUnlink(existingConfig.image_url);
                updateData.image_url = `/uploads/config/image/${req.files.image[0].filename}`;
            }
        }

        // Check duplicate screen name
        if (updateData.partner_screen_name) {
            const duplicate = await PartnerConfig.findOne({
                partner_screen_name: updateData.partner_screen_name,
                _id: { $ne: id }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "Partner config with this screen name already exists"
                });
            }
        }

        const config = await PartnerConfig.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        const responseData = config.toObject();
        responseData.audioUrl = fileUrl(req, responseData.audioUrl);
        responseData.image_url = fileUrl(req, responseData.image_url);

        return res.status(200).json({
            success: true,
            data: responseData,
            message: "Partner config updated successfully"
        });

    } catch (err) {
        console.error("updatePartnerConfig error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to update partner config"
        });
    }
};

// ============================================================
// DELETE PARTNER CONFIG
// ============================================================
exports.deletePartnerConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid partner config ID"
            });
        }

        const config = await PartnerConfig.findByIdAndDelete(id);

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Partner config not found"
            });
        }

        // Clean up associated files from storage
        if (config.audioUrl) safeUnlink(config.audioUrl);
        if (config.image_url) safeUnlink(config.image_url);

        const responseData = config.toObject();
        responseData.audioUrl = fileUrl(req, responseData.audioUrl);
        responseData.image_url = fileUrl(req, responseData.image_url);

        return res.status(200).json({
            success: true,
            data: responseData,
            message: "Partner config deleted successfully"
        });

    } catch (err) {
        console.error("deletePartnerConfig error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to delete partner config"
        });
    }
};
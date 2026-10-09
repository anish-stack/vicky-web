"use strict";

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const PartnerConfig = require("../models/PartnerConfig"); // path apne project ke hisaab se adjust karein

// ============================================================
// HELPERS
// ============================================================

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads", "config");

// DB mein hamesha relative path store hota hai: /uploads/config/<type>/<filename>
const storedPath = (file, type) => `/uploads/config/${type}/${file.filename}`;

// Relative path ko full URL banata hai. Pehle se full URL ho toh waisa hi chhod deta hai.
// Agar aapke project mein fileUrl pehle se hai, toh yeh function hata kar apna import kar sakte hain.
const fileUrl = (req, p) => {
    if (!p) return p;
    if (/^(https?:)?\/\//i.test(p) || p.startsWith("data:")) return p;

    const base =
        process.env.FILE_BASE_URL ||
        `${req.headers["x-forwarded-proto"] || req.protocol}://${req.get("host")}`;

    return `${base.replace(/\/$/, "")}${p.startsWith("/") ? "" : "/"}${p}`;
};

// Config document ko response format mein badalta hai (full URLs + images position wise)
const formatConfig = (req, config) => {
    const data =
        typeof config.toObject === "function" ? config.toObject() : { ...config };

    data.audioUrl = fileUrl(req, data.audioUrl);
    data.image_url = fileUrl(req, data.image_url);
    data.images = (data.images || [])
        .map((img) => ({ ...img, url: fileUrl(req, img.url) }))
        .sort((a, b) => a.position - b.position);

    return data;
};

// Safe JSON parse (form-data mein arrays string ban kar aate hain)
const parseJSON = (value, fallback) => {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch (e) {
        return fallback;
    }
};

// URL / relative path se disk ki file delete karta hai (sirf uploads/config ke andar)
const deleteFileByUrl = (url) => {
    if (!url) return;

    try {
        let pathname = url;
        if (/^(https?:)?\/\//i.test(url)) {
            pathname = new URL(url, "http://localhost").pathname;
        }

        const absolute = path.resolve(process.cwd(), "." + decodeURIComponent(pathname));

        // Safety: uploads/config ke bahar ki file kabhi delete nahi hogi
        if (!absolute.startsWith(UPLOAD_ROOT + path.sep)) return;

        fs.unlink(absolute, (err) => {
            if (err && err.code !== "ENOENT") {
                console.error("File delete error:", absolute, err.message);
            }
        });
    } catch (err) {
        console.error("deleteFileByUrl error:", err.message);
    }
};

// Request fail ho jaye toh upload hui files disk se hata deta hai
const cleanupUploadedFiles = (files) => {
    if (!files) return;
    Object.values(files)
        .flat()
        .forEach((file) => {
            if (file?.path) fs.unlink(file.path, () => {});
        });
};

const buildNewImages = (files, positionsRaw, startPosition) => {
    const positions = parseJSON(positionsRaw, []);

    return files.map((file, index) => {
        const given = Array.isArray(positions) ? positions[index] : undefined;
        const position =
            given !== undefined && given !== null && !Number.isNaN(Number(given))
                ? Number(given)
                : startPosition + index;

        return { url: storedPath(file, "image"), position };
    });
};

// ============================================================
// 1. CREATE
// ============================================================
exports.createPartnerConfig = async (req, res) => {
    try {
        const { partner_screen_name, code_to_copy } = req.body;

        if (!partner_screen_name || !partner_screen_name.trim()) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "partner_screen_name is required"
            });
        }

        const data = {
            partner_screen_name: partner_screen_name.trim(),
            code_to_copy: code_to_copy || null
        };

        if (req.files?.audio?.[0]) {
            data.audioUrl = storedPath(req.files.audio[0], "audio");
        }

        // OLD: single image
        if (req.files?.image?.[0]) {
            data.image_url = storedPath(req.files.image[0], "image");
        }

        // NEW: multiple images with position
        if (req.files?.images?.length) {
            data.images = buildNewImages(req.files.images, req.body.positions, 1);
        }

        const config = await PartnerConfig.create(data);

        return res.status(201).json({
            success: true,
            data: formatConfig(req, config),
            message: "Partner config created successfully"
        });
    } catch (err) {
        cleanupUploadedFiles(req.files);
        console.error("createPartnerConfig error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to create partner config"
        });
    }
};

// ============================================================
// 2. GET ALL
// ============================================================
exports.getAllPartnerConfigs = async (req, res) => {
    try {
        const configs = await PartnerConfig.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: configs.map((c) => formatConfig(req, c)),
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
// 3. GET BY SCREEN NAME
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

        return res.status(200).json({
            success: true,
            data: formatConfig(req, config),
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
// 4. UPDATE
// ============================================================
exports.updatePartnerConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({
                success: false,
                message: "Invalid config id"
            });
        }

        const config = await PartnerConfig.findById(id);

        if (!config) {
            cleanupUploadedFiles(req.files);
            return res.status(404).json({
                success: false,
                message: "Partner config not found"
            });
        }

        const { partner_screen_name, code_to_copy } = req.body;

        if (partner_screen_name !== undefined && partner_screen_name.trim()) {
            config.partner_screen_name = partner_screen_name.trim();
        }

        if (code_to_copy !== undefined) {
            config.code_to_copy = code_to_copy || null;
        }

        // Audio replace (purani file disk se hatao)
        if (req.files?.audio?.[0]) {
            deleteFileByUrl(config.audioUrl);
            config.audioUrl = storedPath(req.files.audio[0], "audio");
        }

        // OLD single image replace
        if (req.files?.image?.[0]) {
            deleteFileByUrl(config.image_url);
            config.image_url = storedPath(req.files.image[0], "image");
        }

        // Existing images ki position update
        // body: updatePositions = '[{"imageId":"abc","position":2}]'
        const updatePositions = parseJSON(req.body.updatePositions, []);
        if (Array.isArray(updatePositions)) {
            updatePositions.forEach(({ imageId, position }) => {
                const img = config.images.id(imageId);
                if (img && !Number.isNaN(Number(position))) {
                    img.position = Number(position);
                }
            });
        }

        // Images remove
        // body: removeImageIds = '["abc","def"]'
        const removeImageIds = parseJSON(req.body.removeImageIds, []);
        if (Array.isArray(removeImageIds) && removeImageIds.length) {
            const removeSet = new Set(removeImageIds.map(String));

            config.images
                .filter((img) => removeSet.has(img._id.toString()))
                .forEach((img) => deleteFileByUrl(img.url));

            config.images = config.images.filter(
                (img) => !removeSet.has(img._id.toString())
            );
        }

        // NEW images add (purani images delete nahi hoti)
        if (req.files?.images?.length) {
            const maxPosition = config.images.length
                ? Math.max(...config.images.map((i) => i.position || 0))
                : 0;

            const newImages = buildNewImages(
                req.files.images,
                req.body.positions,
                maxPosition + 1
            );

            newImages.forEach((img) => config.images.push(img));
        }

        // Hamesha position ke order mein save
        config.images.sort((a, b) => a.position - b.position);

        await config.save();

        return res.status(200).json({
            success: true,
            data: formatConfig(req, config),
            message: "Partner config updated successfully"
        });
    } catch (err) {
        cleanupUploadedFiles(req.files);
        console.error("updatePartnerConfig error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to update partner config"
        });
    }
};

// ============================================================
// 5. DELETE
// ============================================================
exports.deletePartnerConfig = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid config id"
            });
        }

        const config = await PartnerConfig.findByIdAndDelete(id);

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "Partner config not found"
            });
        }

        // Disk se saari files hatao
        deleteFileByUrl(config.audioUrl);
        deleteFileByUrl(config.image_url);
        (config.images || []).forEach((img) => deleteFileByUrl(img.url));

        return res.status(200).json({
            success: true,
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
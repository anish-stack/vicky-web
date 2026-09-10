"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const partnerConfigController = require("../controllers/partnerConfigController"); 

// ============================================================
// MULTER STORAGE CONFIGURATION
// ============================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = "./uploads/config/";
        
        if (file.fieldname === "audio") {
            uploadPath += "audio";
        } else if (file.fieldname === "image") {
            uploadPath += "image";
        } else {
            uploadPath += "misc";
        }

        // Ensure the directory exists synchronously
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB file size limit
});

// Middleware configuration for fields
const uploadConfigFields = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 }
]);


// ============================================================
// PARTNER CONFIG ROUTES
// ============================================================

// 1. Create Partner Config (with file upload)
router.post("/", uploadConfigFields, partnerConfigController.createPartnerConfig);

// 2. Get All Partner Configs
router.get("/", partnerConfigController.getAllPartnerConfigs);

// 3. Get Partner Config by Screen Name
router.get("/screen/:screenName", partnerConfigController.getPartnerConfigByScreen);

// 4. Update Partner Config (with optional file upload)
router.put("/:id", uploadConfigFields, partnerConfigController.updatePartnerConfig);

// 5. Delete Partner Config
router.delete("/:id", partnerConfigController.deletePartnerConfig);

module.exports = router;
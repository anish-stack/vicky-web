"use strict";

const express = require("express");
const router = express.Router();
const { memoryUpload, withImgCloud } = require("../middleware/imgcloudUpload");

const partnerConfigController = require("../controllers/partnerConfigController"); 

// ============================================================
// MULTER (memory) + IMGCLOUD
// ============================================================
const upload = memoryUpload({ fileSize: 15 * 1024 * 1024 }); // 15MB

const uploadConfigFields = withImgCloud(
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },      // OLD - single image (backward compatible)
    { name: "images", maxCount: 10 }     // NEW - multiple images
  ]),
  (file) => (file.fieldname === "audio" ? "config-audio" : "config-image")
);

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
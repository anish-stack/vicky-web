// routes/CarMechnic.routes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const ctrl = require("../controllers/RecoveryVehicle");


const uploadDir = path.join(__dirname, "..", "uploads", "mechanics");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  }
});
const providerUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 8 }
]);

/* ===================== USER SIDE ===================== */

router.post("/register", providerUpload, ctrl.registerRecoveryVehicle);
router.post("/verify-otp", ctrl.verifyOTP);
router.post("/resend-otp", ctrl.resendOTP);

router.get("/profile/me", ctrl.getMyProfile);
router.put("/profile/:id", providerUpload, ctrl.updateMyProfile);
router.delete("/profile/:id/gallery-image", ctrl.removeGalleryImage);

router.get("/", ctrl.getAllRecoveryVehicles);
router.get("/:id", ctrl.getRecoveryVehicleById);

/* ===================== CONTACT LOGS ===================== */

router.post("/contact-log", ctrl.createContactLog);
router.put("/contact-log/:id/status", ctrl.updateContactLogStatus);
router.get("/contact-log/user/:userId", ctrl.getMyContactLogs);

/* ===================== ADMIN SIDE ===================== */

router.get("/admin/all", ctrl.adminGetAllRecoveryVehicles);
router.get("/admin/stats", ctrl.adminGetStats);
router.get("/admin/:id", ctrl.adminGetRecoveryVehicleById);
router.post("/admin/create", providerUpload, ctrl.adminCreateRecoveryVehicle);
router.put("/admin/:id", providerUpload, ctrl.adminUpdateRecoveryVehicle);
router.patch("/admin/:id/status", ctrl.adminUpdateProviderStatus);
router.patch("/admin/:id/badges", ctrl.adminUpdateProviderBadges);
router.delete("/admin/:id", ctrl.adminDeleteRecoveryVehicle);

router.get("/admin/contact-log/all", ctrl.adminGetAllContactLogs);
router.get("/admin/contact-log/provider/:id", ctrl.adminGetProviderContactLogs);

module.exports = router;

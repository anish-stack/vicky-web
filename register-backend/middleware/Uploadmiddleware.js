const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ===============================
   CREATE DIRECTORY IF NOT EXISTS
================================*/
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/* ===============================
   UPLOAD BASE PATH
================================*/
const UPLOAD_BASE = path.join(__dirname, "../uploads");

createDirIfNotExists(`${UPLOAD_BASE}/profiles`);
createDirIfNotExists(`${UPLOAD_BASE}/tour`);
createDirIfNotExists(`${UPLOAD_BASE}/shop`);
createDirIfNotExists(`${UPLOAD_BASE}/garage`);
createDirIfNotExists(`${UPLOAD_BASE}/documents`);

/* ===============================
   MULTER STORAGE
================================*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_BASE;

    if (file.fieldname === "profileImage") {
      uploadPath = `${UPLOAD_BASE}/profiles`;
    } 
    else if (file.fieldname === "tourImages") {
      uploadPath = `${UPLOAD_BASE}/tour`;
    } 
    else if (file.fieldname === "shopImages") {
      uploadPath = `${UPLOAD_BASE}/shop`;
    } 
    else if (file.fieldname === "garageImages") {
      uploadPath = `${UPLOAD_BASE}/garage`;
    } 
    else if (
      file.fieldname === "aadharFront" ||
      file.fieldname === "aadharBack" ||
      file.fieldname === "panCard"
    ) {
      uploadPath = `${UPLOAD_BASE}/documents`;
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext =
      path.extname(file.originalname) ||
      "." + file.mimetype.split("/")[1];

    const uniqueName =
      file.fieldname +
      "-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(null, uniqueName + ext);
  },
});

/* ===============================
   FILE FILTER
================================*/
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  cb(
    new Error("Only image files (jpeg, jpg, png, webp) are allowed"),
    false
  );
};

/* ===============================
   MULTER INSTANCE
================================*/
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

/* ===============================
   MULTIPLE FILE UPLOAD
================================*/
exports.uploadUserImages = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "tourImages", maxCount: 8 },
  { name: "shopImages", maxCount: 8 },
  { name: "garageImages", maxCount: 8 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
]);

/* ===============================
   SINGLE PROFILE IMAGE
================================*/
exports.uploadProfileImage = upload.single("profileImage");

/* ===============================
   EXTRACT FILE PATHS
================================*/
exports.extractUploadedFiles = (reqFiles = {}) => {
  const result = {};

  if (reqFiles.profileImage?.[0]) {
    result.profileImage =
      `/uploads/profiles/${reqFiles.profileImage[0].filename}`;
  }

  if (reqFiles.aadharFront?.[0]) {
    result.aadharFront =
      `/uploads/documents/${reqFiles.aadharFront[0].filename}`;
  }

  if (reqFiles.aadharBack?.[0]) {
    result.aadharBack =
      `/uploads/documents/${reqFiles.aadharBack[0].filename}`;
  }

  if (reqFiles.panCard?.[0]) {
    result.panCard =
      `/uploads/documents/${reqFiles.panCard[0].filename}`;
  }

  return result;
};

/* ===============================
   CLEANUP FILES ON ERROR
================================*/
exports.cleanupUploadedFiles = (reqFiles = {}) => {
  Object.values(reqFiles).forEach((fileArr) => {
    fileArr.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("File cleanup error:", err.message);
          }
        });
      }
    });
  });
};
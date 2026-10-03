const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Same folder that app.js serves at /uploads (independent of process.cwd()).
const uploadDir = path.join(__dirname, "..", "uploads", "tour-packages");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${base}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
  }

  cb(null, true);
};

const TourPackageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 5 * 1024 * 1024,
    files: 60,
  },
});

module.exports = TourPackageUpload;
module.exports.uploadDir = uploadDir;

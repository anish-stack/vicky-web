const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ApiError = require("../utils/apiError");

const ROOT = path.join(__dirname, "..", "..", "uploads");

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

/**
 * Stored name = slug of the original + a short random suffix, so two people
 * uploading `cover.jpg` never overwrite each other. The suffix means the
 * filename on disk is NOT the original name — callers must persist the
 * `publicPath` returned by the media controller rather than guessing it.
 */
const makeUploader = (folder = "general") => {
  const dest = path.join(ROOT, folder);
  fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base =
        path
          .basename(file.originalname, ext)
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase()
          .slice(0, 48) || "image";
      const suffix = crypto.randomBytes(4).toString("hex");
      cb(null, `${base}-${suffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 6 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED.includes(file.mimetype)) {
        return cb(ApiError.badRequest("Only JPG, PNG, WEBP, AVIF or SVG images are allowed"));
      }
      cb(null, true);
    },
  });
};

module.exports = { makeUploader, UPLOAD_ROOT: ROOT };
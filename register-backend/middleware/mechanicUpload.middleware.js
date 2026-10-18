// middlewares/mechanicUpload.middleware.js (ImgCloud)
const path = require("path");
const { memoryUpload, withImgCloud } = require("./imgcloudUpload");

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error("Only image files (jpeg, jpg, png, webp) allowed"));
};

const upload = memoryUpload({ fileSize: 5 * 1024 * 1024, fileFilter });

const mechanicImageUpload = withImgCloud(
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 }
  ]),
  "mechanics"
);

module.exports = { mechanicImageUpload };

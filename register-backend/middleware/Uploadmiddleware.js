const path = require("path");
const {
  memoryUpload,
  withImgCloud,
  cleanupCloudFiles,
} = require("./imgcloudUpload");

/* ===============================
   FIELD -> IMGCLOUD FOLDER
================================*/
const folderFor = (file) => {
  switch (file.fieldname) {
    case "profileImage":
      return "profiles";
    case "tourImages":
      return "tour";
    case "shopImages":
      return "shop";
    case "garageImages":
      return "garage";
    case "officeImages":
      return "other";
    case "aadharFront":
    case "aadharBack":
    case "panCard":
      return "documents";
    default:
      return "other";
  }
};

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
   MULTER (memory) INSTANCE
================================*/
const upload = memoryUpload({ fileSize: 5 * 1024 * 1024, fileFilter, files: 10 });

/* ===============================
   MULTIPLE FILE UPLOAD  (multer + ImgCloud)
================================*/
exports.uploadUserImages = withImgCloud(
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "tourImages", maxCount: 8 },
    { name: "officeImages", maxCount: 8 },
    { name: "shopImages", maxCount: 8 },
    { name: "garageImages", maxCount: 8 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
  ]),
  folderFor
);

/* ===============================
   SINGLE PROFILE IMAGE
================================*/
exports.uploadProfileImage = withImgCloud(
  upload.single("profileImage"),
  folderFor
);

/* ===============================
   EXTRACT FILE URLS (ImgCloud urls)
================================*/
exports.extractUploadedFiles = (reqFiles = {}) => {
  const result = {};

  ["profileImage", "aadharFront", "aadharBack", "panCard"].forEach((k) => {
    if (reqFiles[k]?.[0]) result[k] = reqFiles[k][0].url;
  });

  ["tourImages", "officeImages", "shopImages", "garageImages"].forEach((k) => {
    if (reqFiles[k]?.length) result[k] = reqFiles[k].map((f) => f.url);
  });

  return result;
};

/* ===============================
   CLEANUP FILES ON ERROR (delete from ImgCloud)
================================*/
exports.cleanupUploadedFiles = (reqFiles = {}) => {
  cleanupCloudFiles(reqFiles).catch((e) =>
    console.error("File cleanup error:", e.message)
  );
};

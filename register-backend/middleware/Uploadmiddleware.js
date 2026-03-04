const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createDirIfNotExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const UPLOAD_BASE = path.join(__dirname, "../uploads");

createDirIfNotExists(`${UPLOAD_BASE}/profiles`);
createDirIfNotExists(`${UPLOAD_BASE}/tour`);
createDirIfNotExists(`${UPLOAD_BASE}/shop`);
createDirIfNotExists(`${UPLOAD_BASE}/garage`);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.body.category || req.user?.category;

        if (file.fieldname === "profileImage") {
            cb(null, `${UPLOAD_BASE}/profiles`);
        } else if (file.fieldname === "tourImages") {
            cb(null, `${UPLOAD_BASE}/tour`);
        } else if (file.fieldname === "shopImages") {
            cb(null, `${UPLOAD_BASE}/shop`);
        } else if (file.fieldname === "garageImages") {
            cb(null, `${UPLOAD_BASE}/garage`);
        } else {
            cb(null, UPLOAD_BASE);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = file.fieldname.replace(/\[.*\]/g, ""); // strip array brackets
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, 
        files: 10
    }
});


exports.uploadUserImages = upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "tourImages", maxCount: 8 },
    { name: "shopImages", maxCount: 8 },
    { name: "garageImages", maxCount: 8 }
]);


exports.uploadProfileImage = upload.single("profileImage");


exports.extractUploadedFiles = (reqFiles = {}) => {
    const result = {};

    if (reqFiles.profileImage && reqFiles.profileImage[0]) {
        result.profileImage = `/uploads/profiles/${reqFiles.profileImage[0].filename}`;
    }

    if (reqFiles.tourImages) {
        result.tourImages = reqFiles.tourImages.map(f => `/uploads/tour/${f.filename}`);
    }

    if (reqFiles.shopImages) {
        result.shopImages = reqFiles.shopImages.map(f => `/uploads/shop/${f.filename}`);
    }

    if (reqFiles.garageImages) {
        result.garageImages = reqFiles.garageImages.map(f => `/uploads/garage/${f.filename}`);
    }

    return result;
};


exports.cleanupUploadedFiles = (reqFiles = {}) => {
    Object.values(reqFiles).forEach(fileArr => {
        fileArr.forEach(file => {
            fs.unlink(file.path, (err) => {
                if (err) console.error("Cleanup error:", err.message);
            });
        });
    });
};
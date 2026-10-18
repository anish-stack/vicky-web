// middleware/restaurantUpload.middleware.js (ImgCloud)
const { memoryUpload, withImgCloud } = require("./imgcloudUpload");

const upload = memoryUpload({
  fileSize: 5 * 1024 * 1024,
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

exports.restaurantImageUpload = withImgCloud(
  upload.fields([{ name: "photos", maxCount: 5 }]),
  "restaurants"
);

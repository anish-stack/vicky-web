const express = require("express");
const router = express.Router();
const { create, update, getAll, getById, deleteById } = require("../controllers/dhamPackageController");
const upload = require("../middlewares/multerConfigDham");
const admin = require("../middlewares/adminMiddleware");

// auth runs before multer so rejected requests never write files to disk
router.post("/", admin, upload.single("image"), create);
router.put("/:id", admin, upload.single("image"), update);
router.get("/:id", getById);
router.get("/", getAll);
router.delete("/:id", admin, deleteById);

module.exports = router;

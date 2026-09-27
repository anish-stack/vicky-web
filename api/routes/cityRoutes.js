const express = require("express");
const router = express.Router();
const {
  create,
  update,
  getAll,
  getById,
  deleteById,
  getCitiesByRentalPlan,
  importPincodes,
} = require("../controllers/cityController");
const admin = require("../middlewares/adminMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/import-pincodes/:city_id", admin, upload.single("file"), importPincodes);
router.post("/", admin, create);
router.put("/:id", admin, update);
router.get("/by-local-plan", getCitiesByRentalPlan);
router.get("/:id", admin, getById);
router.get("/", getAll);
router.delete("/:id", admin, deleteById);

module.exports = router;

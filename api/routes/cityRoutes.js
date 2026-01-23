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

const authMiddleware = require("../middlewares/authMiddleware");

const upload = require("../middlewares/uploadMiddleware");

// router.get("/cities-export", exportCitiesPincode);

router.post(
	"/import-pincodes/:city_id",
	authMiddleware,
	upload.single("file"),
	importPincodes
);
router.post("/", authMiddleware, create);
router.put("/:id", authMiddleware, update);

router.get("/by-local-plan", getCitiesByRentalPlan);
router.get("/:id", authMiddleware, getById);

router.get("/", getAll);
router.delete("/:id", authMiddleware, deleteById);

module.exports = router;

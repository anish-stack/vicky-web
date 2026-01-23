const express = require("express");
const multer = require("multer");
const {
	autocomplete,
	distancematrix,
	getLocalityPlaceId,
	getPincodeFromPlaceId,
	autocompletecity,
} = require("../controllers/googleMapController");
// const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const upload = multer();

router.get("/autocompletecity", autocompletecity);
router.get("/autocomplete", autocomplete);
router.get("/distancematrix", distancematrix);
router.get("/locality", getLocalityPlaceId);
router.get("/getpincode", getPincodeFromPlaceId);
module.exports = router;

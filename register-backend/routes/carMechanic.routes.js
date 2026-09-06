// routes/carMechanic.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/CarMechnic.controller");
const { mechanicImageUpload } = require("../middleware/mechanicUpload.middleware");
// const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

router.post("/", mechanicImageUpload, ctrl.createMechanic);
router.put("/:id", mechanicImageUpload, ctrl.updateMechanic);

router.post("/verify-otp", ctrl.verifyMechanicOtp);
router.post("/resend-otp", ctrl.resendMechanicOtp);
router.delete("/:id", ctrl.deleteMechanic);
router.get("/", ctrl.getAllMechanics);
router.get("/:id", ctrl.getOneMechanic);

router.patch("/:id/status", /* adminAuth, */ ctrl.updateMechanicStatus);
router.post("/:id/contact", /* userAuth, */ ctrl.trackContact);
router.get("/:id/contact-logs", /* adminAuth, */ ctrl.getMechanicContactLogs);
router.get("/options/all", ctrl.getMechanicOptions);
module.exports = router;
// routes/carMechanic.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/CarMechnic.controller");
const { mechanicImageUpload } = require("../middleware/mechanicUpload.middleware");
// const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

router.post("/", mechanicImageUpload, ctrl.createMechanic);
router.put("/:id", mechanicImageUpload, ctrl.updateMechanic);
// routes/mechanic.routes.js additions
router.post("/:id/kyc/create-order", ctrl.createMechanicKycOrder);
router.post("/:id/kyc/verify-payment", ctrl.verifyMechanicKycPayment);
router.post("/:id/kyc/aadhaar/send-otp", ctrl.sendMechanicAadhaarOtp);
router.post("/:id/kyc/aadhaar/verify-otp", ctrl.verifyMechanicAadhaarOtp);

router.post("/verify-otp", ctrl.verifyMechanicOtp);
router.post("/resend-otp", ctrl.resendMechanicOtp);
router.delete("/:id", ctrl.deleteMechanic);
router.get("/", ctrl.getAllMechanics);

router.get("/all", ctrl.getAllMechanics);
router.get("/:id", ctrl.getOneMechanic);

router.patch("/:id/status", /* adminAuth, */ ctrl.updateMechanicStatus);
router.post("/:id/contact", /* userAuth, */ ctrl.trackContact);
router.get("/:id/contact-logs", /* adminAuth, */ ctrl.getMechanicContactLogs);
router.get("/:userId/contact-logs-user", /* adminAuth, */ ctrl.getMechanicContactLogsForUser);



router.get("/options/all", ctrl.getMechanicOptions);
module.exports = router;
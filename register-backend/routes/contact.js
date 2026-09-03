const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { sendTourGuideBookingRequest } = require("../controllers/TourGuideBooking");

router.post("/create", contactController.createContact);
router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);
router.put("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);


// New Routes
router.post("/tour-guide-booking-request", sendTourGuideBookingRequest);



module.exports = router;
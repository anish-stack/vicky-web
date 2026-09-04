const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const {
    sendTourGuideBookingRequest,
    getMyTourGuideBookingRequests,
    generateSecurityDepositPaymentLink,
    invalidateSecurityDepositPaymentLink,
    verifySecurityDepositPayment,
    getTourGuideBookingDetails,
    checkAndSyncPaymentStatus,
    cancelTourGuideBookingRequest
} = require("../controllers/TourGuideBooking");

const {
    createContactRequest,
    getMyContactRequests,
} = require("../controllers/rtoContactRequest.controller");


router.post("/create", contactController.createContact);
router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);
router.put("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);


// ===================== Tour Guide Booking Routes =====================

router.post("/tour-guide-booking-request", sendTourGuideBookingRequest);
router.get("/tour-guide-booking-request/:phone", getMyTourGuideBookingRequests);

// ✅ Literal-path routes MUST come before the generic "/:phone/:bookingId" route,
// otherwise Express matches them into :phone / :bookingId wrongly.
router.get(
    "/tour-guide-booking/payment-status/:bookingId",
    checkAndSyncPaymentStatus
);

// Generic 2-param route — keep this AFTER all literal-segment routes above
router.get(
    "/tour-guide-booking/:phone/:bookingId",
    getTourGuideBookingDetails
);

router.delete(
    "/tour-guide-booking/:phone/:bookingId",
    cancelTourGuideBookingRequest
);

router.post(
    "/tour-guide-booking/:bookingId/payment-link",
    generateSecurityDepositPaymentLink
);

router.post(
    "/tour-guide-booking/:bookingId/payment-link/invalidate",
    invalidateSecurityDepositPaymentLink
);

router.post(
    "/payment-link/webhook",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
        console.log("========== RAZORPAY WEBHOOK RECEIVED ==========");
        console.log("Headers:", req.headers);
        console.log("Raw Body:", req.body?.toString("utf8"));

        req.rawBody = req.body;

        try {
            req.body = JSON.parse(req.body.toString("utf8"));
            console.log("Parsed Webhook:", JSON.stringify(req.body, null, 2));
            console.log("Event:", req.body.event);
        } catch (error) {
            console.error("Webhook JSON Parse Error:", error);
            return res.status(400).json({
                success: false,
                message: "Invalid webhook payload"
            });
        }

        next();
    },
    verifySecurityDepositPayment

    
);



// RTO Routes

router.post("/rto-agent/request", createContactRequest);
router.get("/rto-agent/request/:_id", getMyContactRequests);


module.exports = router;
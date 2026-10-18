const express = require("express");
const router = express.Router();
const { memoryUpload, withImgCloud } = require("../middleware/imgcloudUpload");
const ctrl = require("../controllers/VltdController"); // Adjust path to your controller file

// Memory upload -> ImgCloud (payment proofs)
const upload = memoryUpload({
  fileSize: 5 * 1024 * 1024, // Max 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDF files are allowed for payment proof."));
    }
  },
});

const uploadPaymentProof = withImgCloud(
  upload.fields([{ name: "paymentProof", maxCount: 1 }]),
  "payment-proofs"
);

/* ======================================================
   PUBLIC / USER ROUTES
====================================================== */

// Get VLTD product specs & configurations
router.get("/product", ctrl.getVltdProduct);

// Get pickup locations (Optional query param: ?state=Delhi)
router.get("/pickups", ctrl.getPickupLocationsByState);
// Create
router.post("/pickup-locations", ctrl.createPickupLocation);

// Update
router.put("/pickup-locations/:id", ctrl.updatePickupLocation);
router.get("/pickup-locations/all", ctrl.getAllPickupLocations);
// Delete
router.delete("/pickup-locations/:id", ctrl.deletePickupLocation);
// Create a new VLTD order (with payment proof screenshot/PDF upload)
router.post("/orders", uploadPaymentProof, ctrl.createVltdOrder);

// Get order history for a specific user
router.get("/orders/user/:userId", ctrl.getUserVltdOrders);

/* ======================================================
   ADMIN ROUTES
====================================================== */

// Get all VLTD orders (Optional filter: ?status=pending_verification)
router.get("/admin/orders", ctrl.adminGetAllVltdOrders);
router.get("/admin/orders/:id", ctrl.adminGetSingleVltdOrder);

// Update order status (e.g. verified, dispatched, completed, cancelled)
router.patch("/admin/orders/:id/status", ctrl.adminUpdateOrderStatus);

module.exports = router;

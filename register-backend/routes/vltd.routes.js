const express = require('express');
const fs = require("fs");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/VltdController'); // Adjust path to your controller file

// Configure Multer storage for payment proofs and uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'mechanics');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed for payment proof.'));
    }
  }
});

const uploadPaymentProof = upload.fields([
  { name: 'paymentProof', maxCount: 1 }
]);

/* ======================================================
   PUBLIC / USER ROUTES
====================================================== */

// Get VLTD product specs & configurations
router.get('/product', ctrl.getVltdProduct);

// Get pickup locations (Optional query param: ?state=Delhi)
router.get('/pickups', ctrl.getPickupLocationsByState);

// Create a new VLTD order (with payment proof screenshot/PDF upload)
router.post('/orders', uploadPaymentProof, ctrl.createVltdOrder);

// Get order history for a specific user
router.get('/orders/user/:userId', ctrl.getUserVltdOrders);


/* ======================================================
   ADMIN ROUTES
====================================================== */

// Get all VLTD orders (Optional filter: ?status=pending_verification)
router.get('/admin/orders', ctrl.adminGetAllVltdOrders);

// Update order status (e.g. verified, dispatched, completed, cancelled)
router.patch('/admin/orders/:id/status', ctrl.adminUpdateOrderStatus);

module.exports = router;
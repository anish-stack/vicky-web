const mongoose = require('mongoose');

const vltdOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Form Selections
  state: { type: String, required: true },
  pickupLocation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VltdPickupLocation', 
    required: true 
  },
  vehicleNumber: { type: String, required: true, uppercase: true }, // e.g., DL01AB1234
  userName: { type: String, required: true },
  mobileNumber: { type: String, required: true },

  // Recharge Plan Selected
  rechargePlan: {
    durationYears: { type: Number, required: true }, // 1 or 2
    planTitle: { type: String, required: true }, // "1 Year Recharge"
    simPrice: { type: Number, required: true } // e.g., 3500
  },

  // Payment Summary Calculation Breakdown
  paymentSummary: {
    devicePrice: { type: Number, required: true, default: 1399 },
    simCardRechargePrice: { type: Number, required: true },
    taxiSafarFees: { type: Number, required: true, default: 200 },
    totalAmount: { type: Number, required: true } // e.g., 5099
  },

  // Payment Proof Upload (Screenshot / PDF max 5MB)
  paymentProofUrl: { type: String, required: true },

  // Order Fulfillment Status
  orderStatus: { 
    type: String, 
    enum: ['pending_verification', 'verified', 'dispatched', 'completed', 'cancelled'], 
    default: 'pending_verification' 
  }
}, { timestamps: true });

module.exports = mongoose.model('VltdOrder', vltdOrderSchema);
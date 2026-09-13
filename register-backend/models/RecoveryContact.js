const mongoose = require('mongoose');

const recoveryContactLogSchema = new mongoose.Schema({
  recoveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecoveryVehicleUser',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  aadharData: {
    aadhaarNumber: {
      type: String,
    },

    request_id: {
      type: String,
      default: null
    },

    verifiedData: {
      full_name: { type: String, default: null },
      dob: { type: String, default: null },
      gender: { type: String, default: null },

      address: {
        country: { type: String, default: null },
        dist: { type: String, default: null },
        state: { type: String, default: null },
        po: { type: String, default: null },
        loc: { type: String, default: null },
        vtc: { type: String, default: null },
        subdist: { type: String, default: null },
        street: { type: String, default: null },
        house: { type: String, default: null },
        landmark: { type: String, default: null },
      },

      mobile_verified: {
        type: Boolean,
        default: false,
      },

      status: {
        type: String,
        default: null,
      },
    },
  },
  isKycFeeDone: {
    type: Boolean,
    default: false,
  },

  howMuchItsPaid: {
    type: Number,
    default: 0,
    min: 0,
  },

  kycStatus: {
    type: String,
    enum: [
      "pending",
      "payment done",
      "kyc-failed",
      "kyc-success",
    ],
    default: "pending",
  },
  type: {
    type: String,
    enum: ['call', 'whatsapp'],
    required: true
  },
  status: {
    type: String,
    default: 'initiated'
  },
  meta: {
    platform: { type: String }, // e.g., 'android', 'ios'
    appVersion: { type: String } // e.g., '1.1.5'
  }
}, { timestamps: true });

// Index for fast querying by user history
recoveryContactLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RecoveryContactLog', recoveryContactLogSchema);
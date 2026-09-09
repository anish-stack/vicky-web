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
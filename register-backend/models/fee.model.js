const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'kycfee'
    },
    value: {
        type: Number,
        required: true,
        default: 99
    }
});

module.exports = mongoose.model('Fee', feeSchema);

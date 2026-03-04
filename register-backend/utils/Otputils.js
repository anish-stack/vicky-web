const crypto = require("crypto");

exports.generateOTP = () => {
    const otp = crypto.randomInt(100000, 999999);
    return String(otp);
};

exports.getOTPExpiry = () => {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

exports.isOTPExpired = (otpExpires) => {
    return new Date() > new Date(otpExpires);
};
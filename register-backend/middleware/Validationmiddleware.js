const { body, param, query, validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// ─── Register ────────────────────────────────────────────────────────────────
exports.registerRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone is required")
        .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number"),

    body("category")
        .notEmpty().withMessage("Category is required")
        .isIn(["tour_guide", "rto_service", "car_accessory", "car_mechanic"])
        .withMessage("Invalid category"),

    // Tour guide specific
    body("experienceYears")
        .if(body("category").equals("tour_guide"))
        .notEmpty().withMessage("Experience years required for tour guides")
        .isNumeric().withMessage("Experience must be a number"),

    body("languages")
        .if(body("category").equals("tour_guide"))
        .notEmpty().withMessage("Languages required for tour guides"),

    // RTO specific
    body("officeName")
        .if(body("category").equals("rto_service"))
        .notEmpty().withMessage("Office name required for RTO service"),

    body("officeAddress")
        .if(body("category").equals("rto_service"))
        .notEmpty().withMessage("Office address required for RTO service"),

    // Car Accessory specific
    body("shopName")
        .if(body("category").equals("car_accessory"))
        .notEmpty().withMessage("Shop name required for car accessory"),

    // Car Mechanic specific
    body("garageName")
        .if(body("category").equals("car_mechanic"))
        .notEmpty().withMessage("Garage name required for car mechanic"),
];

// ─── OTP Verification ────────────────────────────────────────────────────────
exports.verifyOTPRules = [
    body("phone")
        .trim()
        .notEmpty().withMessage("Phone is required")
        .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number"),

    body("otp")
        .trim()
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits")
        .isNumeric().withMessage("OTP must be numeric"),
];

// ─── Send OTP ────────────────────────────────────────────────────────────────
exports.sendOTPRules = [
    body("phone")
        .trim()
        .notEmpty().withMessage("Phone is required")
        .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number"),
];

// ─── Admin verify / activate ─────────────────────────────────────────────────
exports.adminVerifyRules = [
    param("userId")
        .notEmpty().withMessage("User ID is required")
        .isMongoId().withMessage("Invalid user ID"),

    body("amount")
        .notEmpty().withMessage("Amount is required")
        .isNumeric().withMessage("Amount must be a number")
        .isFloat({ min: 1 }).withMessage("Amount must be at least 1"),
];

// ─── Category filter ─────────────────────────────────────────────────────────
exports.categoryRules = [
    query("category")
        .notEmpty().withMessage("Category query param is required")
        .isIn(["tour_guide", "rto_service", "car_accessory", "car_mechanic"])
        .withMessage("Invalid category"),
];
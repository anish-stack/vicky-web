const User = require("../models/User");
const Payment = require("../models/Payment.model");
const { generateOTP, getOTPExpiry, isOTPExpired } = require("../utils/Otputils");
const { generateToken } = require("../utils/Jwtutils");
const { extractUploadedFiles, cleanupUploadedFiles } = require("../middleware/Uploadmiddleware");
const {
    sendRegistrationSuccess,
    sendPaymentLink,
    sendPaymentSuccess,
} = require("../utils/sendWhatsapp");
const { createPaymentLink, verifyWebhookSignature } = require("../utils/Razorpayutils");
const sendDltMessage = require("../utils/DltMessage");


const MAX_OTP_ATTEMPTS = 5;

const categoryLabel = {
    tour_guide: "Tour Guide",
    rto_service: "RTO Service",
    car_accessory: "Car Accessory Shop",
    car_mechanic: "Car Mechanic"
};


exports.registerUser = async (req, res) => {
    const uploadedFiles = req.files || {};

    try {
        const {
            name, email, phone, category, description,
            city, state, address,
            // Social
            facebook, instagram, youtube, website, whatsapp,
            // Tour guide
            experienceYears, languages, guideLicenseNumber, servicesOffered,
            // RTO
            officeName, officeAddress, services,
            // Car Accessory
            shopName, shopAddress, accessoryTypes,
            // Car Mechanic
            garageName, garageAddress, mechanicExperience, specialization
        } = req.body;

        // Check duplicate
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            cleanupUploadedFiles(uploadedFiles);
            const field = existingUser.email === email.toLowerCase() ? "Email" : "Phone";
            return res.status(409).json({ success: false, message: `${field} is already registered.` });
        }


        const filePaths = extractUploadedFiles(uploadedFiles);

        // Parse arrays (from form-data they may come as comma-separated strings or arrays)
        const parseArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return val.split(",").map(s => s.trim()).filter(Boolean);
        };

        // Build user object
        const userData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            category,
            description,
            city,
            state,
            address,
            profileImage: filePaths.profileImage,
            socialLinks: { facebook, instagram, youtube, website, whatsapp }
        };

        // Category-specific fields
        if (category === "tour_guide") {
            userData.experienceYears = Number(experienceYears);
            userData.languages = parseArray(languages);
            userData.guideLicenseNumber = guideLicenseNumber;
            userData.servicesOffered = parseArray(servicesOffered);
            userData.tourImages = filePaths.tourImages || [];
        }

        if (category === "rto_service") {
            userData.officeName = officeName;
            userData.officeAddress = officeAddress;
            userData.services = parseArray(services);
        }

        if (category === "car_accessory") {
            userData.shopName = shopName;
            userData.shopAddress = shopAddress;
            userData.accessoryTypes = parseArray(accessoryTypes);
            userData.shopImages = filePaths.shopImages || [];
        }

        if (category === "car_mechanic") {
            userData.garageName = garageName;
            userData.garageAddress = garageAddress;
            userData.mechanicExperience = mechanicExperience ? Number(mechanicExperience) : undefined;
            userData.specialization = parseArray(specialization);
            userData.garageImages = filePaths.garageImages || [];
        }

        // Generate OTP
        const otp = generateOTP();
        userData.otp = otp;
        userData.otpExpires = getOTPExpiry();
        userData.otpAttempts = 0;

        const user = await User.create(userData);

        // Send OTP via WhatsApp (non-blocking)
        await sendDltMessage(phone, otp).catch(console.error);

        res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to your WhatsApp number.",
            data: {
                userId: user._id,
                name: user.name,
                phone: user.phone,
                category: user.category,
                isMobileVerified: user.isMobileVerified
            }
        });

    } catch (err) {
        cleanupUploadedFiles(uploadedFiles);
        console.error("registerUser error:", err);
        res.status(500).json({ success: false, message: err.message || "Registration failed." });
    }
};


exports.verifyRegisterOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.isMobileVerified) {
            return res.status(400).json({ success: false, message: "Mobile already verified." });
        }

        // Rate limit check
        if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message: "Too many failed OTP attempts. Please request a new OTP."
            });
        }

        // Expiry check
        if (isOTPExpired(user.otpExpires)) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        // OTP match
        if (user.otp !== otp.trim()) {
            await User.findByIdAndUpdate(user._id, { $inc: { otpAttempts: 1 } });
            const remaining = MAX_OTP_ATTEMPTS - (user.otpAttempts + 1);
            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${remaining > 0 ? `${remaining} attempts remaining.` : "Account locked."}`
            });
        }

        // Mark verified & clear OTP
        await User.findByIdAndUpdate(user._id, {
            isMobileVerified: true,
            otp: null,
            otpExpires: null,
            otpAttempts: 0
        });

        // Send success WhatsApp message
        sendRegistrationSuccess(phone, user.name, user._id).catch(console.error);

        res.status(200).json({
            success: true,
            message: "Mobile number verified successfully. Your profile is under review.",
            data: { userId: user._id, isMobileVerified: true }
        });

    } catch (err) {
        console.error("verifyRegisterOTP error:", err);
        res.status(500).json({ success: false, message: err.message || "OTP verification failed." });
    }
};


exports.sendLoginOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this phone number." });
        }

        if (!user.isMobileVerified) {
            return res.status(403).json({
                success: false,
                message: "Mobile not verified. Please complete registration verification first."
            });
        }

        // Cooldown: prevent OTP spam (30-second cooldown)
        if (user.otpExpires && !isOTPExpired(user.otpExpires)) {
            const secondsLeft = Math.ceil((new Date(user.otpExpires) - Date.now()) / 1000);
            // Only block if the OTP was recently created (within last 4.5 min = 270 sec)
            if (secondsLeft > 270) {
                return res.status(429).json({
                    success: false,
                    message: `OTP already sent. Please wait ${secondsLeft - 270} seconds before requesting again.`
                });
            }
        }

        const otp = generateOTP();

        await User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires: getOTPExpiry(),
            otpAttempts: 0
        });

        // Send OTP via WhatsApp
        await sendDltMessage(phone, otp).catch(console.error);


        res.status(200).json({
            success: true,
            message: "OTP sent to your WhatsApp number.",
            data: { phone }
        });

    } catch (err) {
        console.error("sendLoginOTP error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to send OTP." });
    }
};

exports.verifyLoginOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const user = await User.findOne({ phone }).select("+otp +otpExpires +otpAttempts");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Rate limit
        if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message: "Too many failed attempts. Please request a new OTP."
            });
        }

        // Expiry
        if (!user.otpExpires || isOTPExpired(user.otpExpires)) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        // Match
        if (user.otp !== otp.trim()) {
            await User.findByIdAndUpdate(user._id, { $inc: { otpAttempts: 1 } });
            const remaining = MAX_OTP_ATTEMPTS - (user.otpAttempts + 1);
            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${remaining > 0 ? `${remaining} attempts remaining.` : "Too many attempts."}`
            });
        }

        // Clear OTP
        await User.findByIdAndUpdate(user._id, {
            otp: null,
            otpExpires: null,
            otpAttempts: 0
        });

        // Generate token
        const token = generateToken({
            id: user._id,
            phone: user.phone,
            category: user.category
        });

        // Fetch clean user object
        const userProfile = await User.findById(user._id).select("-otp -otpExpires -otpAttempts");

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            data: userProfile
        });

    } catch (err) {
        console.error("verifyLoginOTP error:", err);
        res.status(500).json({ success: false, message: err.message || "Login failed." });
    }
};

exports.adminVerifyUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (!user.isMobileVerified) {
            return res.status(400).json({ success: false, message: "User's mobile is not verified yet." });
        }

        if (user.isPaid) {
            return res.status(400).json({ success: false, message: "User has already paid." });
        }

        // Check if an unexpired payment link already exists
        const existingPayment = await Payment.findOne({ userId, status: "pending", paymentLinkExpired: false });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: "A pending payment link already exists for this user.",
                data: { paymentLink: existingPayment.paymentLink }
            });
        }

        // Create Razorpay payment link
        const rzpPaymentLink = await createPaymentLink({
            amount: Number(amount),
            userId: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            description: `TaxiSafar ${categoryLabel[user.category]} Profile Subscription`
        });

        // Validity: 1 year from payment
        const validUpto = new Date();
        validUpto.setFullYear(validUpto.getFullYear() + 1);

        // Save payment document
        const payment = await Payment.create({
            rzp_order_id: rzpPaymentLink.id,
            paymentLink: rzpPaymentLink.short_url,
            amountPaid: Number(amount),
            amountPaidValidUpto: validUpto,
            userId: user._id,
            status: "pending",
            paymentLinkSendOrNot: false,
            paymentLinkExpired: false
        });

        // Send payment link via WhatsApp
        const waResult = await sendPaymentLink(user.phone, user.name, rzpPaymentLink.short_url, user._id);
        if (waResult) {
            await Payment.findByIdAndUpdate(payment._id, { paymentLinkSendOrNot: true });
        }

        res.status(200).json({
            success: true,
            message: "Payment link generated and sent to user via WhatsApp.",
            data: {
                paymentId: payment._id,
                paymentLink: rzpPaymentLink.short_url,
                amount: Number(amount),
                whatsappSent: !!waResult
            }
        });

    } catch (err) {
        console.error("adminVerifyUser error:", err);
        res.status(500).json({ success: false, message: err.message || "Admin verification failed." });
    }
};

exports.paymentSuccessWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const rawBody = req.rawBody || JSON.stringify(req.body);

        // Verify webhook authenticity
        if (!verifyWebhookSignature(rawBody, signature)) {
            console.warn("⚠️  Invalid Razorpay webhook signature");
            return res.status(400).json({ success: false, message: "Invalid signature." });
        }

        const event = req.body.event;

        // Handle payment link paid event
        if (event === "payment_link.paid") {
            const paymentLinkId = req.body.payload?.payment_link?.entity?.id;
            const paymentId = req.body.payload?.payment?.entity?.id;
            const amount = req.body.payload?.payment?.entity?.amount; // in paise

            if (!paymentLinkId) {
                return res.status(400).json({ success: false, message: "Payment link ID missing from webhook." });
            }

            // Find payment record
            const payment = await Payment.findOne({ rzp_order_id: paymentLinkId });
            if (!payment) {
                console.warn(`Payment record not found for rzp id: ${paymentLinkId}`);
                return res.status(200).json({ received: true }); // Acknowledge to avoid retries
            }

            if (payment.status === "paid") {
                return res.status(200).json({ received: true }); // Idempotent
            }

            // Update payment record
            await Payment.findByIdAndUpdate(payment._id, {
                status: "paid",
                paymentId,
                amountPaid: amount ? amount / 100 : payment.amountPaid
            });

            // Update user
            const user = await User.findByIdAndUpdate(
                payment.userId,
                { isPaid: true },
                { new: true }
            );

            if (user) {
                // Send WhatsApp confirmation
                sendPaymentSuccess(user.phone, user.name, user._id).catch(console.error);
            }

            return res.status(200).json({ received: true, success: true });
        }

        // Handle payment link expired
        if (event === "payment_link.expired") {
            const paymentLinkId = req.body.payload?.payment_link?.entity?.id;
            if (paymentLinkId) {
                await Payment.findOneAndUpdate(
                    { rzp_order_id: paymentLinkId },
                    { paymentLinkExpired: true, status: "failed" }
                );
            }
            return res.status(200).json({ received: true });
        }

        // Acknowledge other events
        res.status(200).json({ received: true });

    } catch (err) {
        console.error("paymentSuccessWebhook error:", err);
        // Always return 200 to Razorpay to prevent retries for non-critical errors
        res.status(200).json({ received: true, error: err.message });
    }
};

exports.activateProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (!user.isPaid) {
            return res.status(400).json({ success: false, message: "Payment not completed. Cannot activate profile." });
        }

        if (user.verifiedByAdmin) {
            return res.status(400).json({ success: false, message: "Profile is already active." });
        }

        // Activate profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { verifiedByAdmin: true },
            { new: true }
        ).select("-otp -otpExpires -otpAttempts");

        // Send WhatsApp notification
        // sendProfileLive(user.phone, user.name, user.category, user._id).catch(console.error);

        res.status(200).json({
            success: true,
            message: "Profile activated successfully. User notified via WhatsApp.",
            data: updatedUser
        });

    } catch (err) {
        console.error("activateProfile error:", err);
        res.status(500).json({ success: false, message: err.message || "Profile activation failed." });
    }
};

exports.getAllUsersByCategory = async (req, res) => {
    try {
        const { category, city, state, page = 1, limit = 10, search } = req.query;

        const filter = {
            verifiedByAdmin: true,
            isPaid: true,
            isMobileVerified: true
        };

        if (category) filter.category = category;
        if (city) filter.city = { $regex: new RegExp(city, "i") };
        if (state) filter.state = { $regex: new RegExp(state, "i") };

        if (search) {
            filter.$or = [
                { name: { $regex: new RegExp(search, "i") } },
                { description: { $regex: new RegExp(search, "i") } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-otp -otpExpires -otpAttempts -email")
                .sort({ rating: -1, createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
                hasNextPage: skip + users.length < total
            }
        });

    } catch (err) {
        console.error("getAllUsersByCategory error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to fetch users." });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("-otp -otpExpires -otpAttempts");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if requester is the profile owner (req.user set by protect middleware if token provided)
        const isOwner = req.user && req.user._id.toString() === userId;

        // Non-owners can only see public/active profiles
        if (!isOwner && (!user.verifiedByAdmin || !user.isPaid)) {
            return res.status(404).json({ success: false, message: "Profile not found or not yet active." });
        }

        // Hide sensitive fields for non-owners
        const profile = user.toObject();
        if (!isOwner) {
            delete profile.email;
        }

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (err) {
        console.error("getUserProfile error:", err);
        if (err.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }
        res.status(500).json({ success: false, message: err.message || "Failed to fetch profile." });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { phone, type = "register" } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (type === "register" && user.isMobileVerified) {
            return res.status(400).json({ success: false, message: "Mobile already verified." });
        }

        const otp = generateOTP();

        await User.findByIdAndUpdate(user._id, {
            otp,
            otpExpires: getOTPExpiry(),
            otpAttempts: 0
        });

        if (type === "register") {
            await sendDltMessage(phone, otp, user._id).catch(console.error);

        } else {
            await sendDltMessage(phone, otp).catch(console.error);
        }

        res.status(200).json({
            success: true,
            message: "OTP resent successfully.",
            data: { phone }
        });

    } catch (err) {
        console.error("resendOTP error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to resend OTP." });
    }
};
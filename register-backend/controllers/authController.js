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
const { validatePaymentVerification } = require("razorpay/dist/utils/razorpay-utils");

const MAX_OTP_ATTEMPTS = 5;

const categoryLabel = {
    tour_guide: "Tour Guide",
    rto_service: "RTO Service",
    car_accessory: "Car Accessory Shop",
    car_mechanic: "Car Mechanic"
};


exports.registerUser = async (req, res) => {
    console.log("I am hit")
    const uploadedFiles = req.files || {};
    console.log(uploadedFiles)
    try {
        const {
            name, email, phone, category, description,
            city, state, address,
            // Social
            facebook, instagram, youtube, website, whatsapp,
            // Tour guide
            experienceYears, languages, guideLicenseNumber, servicesOffered,
            // RTO
            officeName, officeAddress, services,rtoOfficeCode,
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
            aadharFront: filePaths.aadharFront,
            aadharBack: filePaths.aadharBack,
            panCard: filePaths.panCard,
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
            userData.rtoOfficeCode = rtoOfficeCode
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

        if(user){
            user.payment=payment._id
            await user.save()
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

    console.log("========== RAZORPAY WEBHOOK RECEIVED ==========");

    // Headers
    console.log("Headers:", req.headers);

    // Raw body
    console.log("Raw Body:", req.rawBody);
    console.log("Raw Query:", req.query);


    // Parsed body
    console.log("Parsed Body:", JSON.stringify(req.body, null, 2));

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    console.log("Signature:", signature);

    // Verify webhook authenticity
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn("⚠️ Invalid Razorpay webhook signature");
      return res.status(400).json({ success: false, message: "Invalid signature." });
    }

    console.log("✅ Signature verified");

    const event = req.body.event;

    console.log("Event Type:", event);

    // Handle payment link paid event
    if (event === "payment_link.paid") {

      const paymentLinkId = req.body.payload?.payment_link?.entity?.id;
      const paymentId = req.body.payload?.payment?.entity?.id;
      const amount = req.body.payload?.payment?.entity?.amount;

      console.log("Payment Link ID:", paymentLinkId);
      console.log("Payment ID:", paymentId);
      console.log("Amount:", amount);

      if (!paymentLinkId) {
        console.log("❌ Payment link ID missing");
        return res.status(400).json({ success: false });
      }

      const payment = await Payment.findOne({ rzp_order_id: paymentLinkId });

      console.log("DB Payment:", payment);

      if (!payment) {
        console.warn("⚠️ Payment record not found:", paymentLinkId);
        return res.status(200).json({ received: true });
      }

      if (payment.status === "paid") {
        console.log("⚠️ Payment already processed");
        return res.status(200).json({ received: true });
      }

      await Payment.findByIdAndUpdate(payment._id, {
        status: "paid",
        paymentId,
        amountPaid: amount ? amount / 100 : payment.amountPaid
      });

      console.log("✅ Payment updated in DB");

      const user = await User.findByIdAndUpdate(
        payment.userId,
        { isPaid: true },
        { new: true }
      );

      console.log("User Updated:", user);

      if (user) {
        console.log("Sending WhatsApp confirmation...");
        sendPaymentSuccess(user.phone, user.name, user._id).catch(console.error);
      }

      return res.status(200).json({ received: true, success: true });
    }

    if (event === "payment_link.expired") {

      const paymentLinkId = req.body.payload?.payment_link?.entity?.id;

      console.log("Payment Link Expired:", paymentLinkId);

      if (paymentLinkId) {
        await Payment.findOneAndUpdate(
          { rzp_order_id: paymentLinkId },
          { paymentLinkExpired: true, status: "failed" }
        );
      }

      return res.status(200).json({ received: true });
    }

    console.log("Unhandled event:", event);

    res.status(200).json({ received: true });

  } catch (err) {

    console.error("paymentSuccessWebhook error:", err);

    res.status(200).json({
      received: true,
      error: err.message
    });
  }
};

const crypto = require("crypto");

exports.paymentSuccessRedirect = async (req, res) => {
  try {

    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature
    } = req.query;
    console.log(req.query)

    const secret = process.env.RAZORPAY_KEY_SECRET;

    const data = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    console.log("Generated:", generatedSignature);
    console.log("Razorpay:", razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    console.log("Payment verified");

    // DB operations
    const payment = await Payment.findOne({
      rzp_order_id: razorpay_payment_link_id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    // if (payment.status === "paid") {
    //   return res.json({
    //     success: true,
    //     message: "Payment already processed"
    //   });
    // }

    await Payment.findByIdAndUpdate(payment._id, {
      status: "paid",
      paymentId: razorpay_payment_id
    });

    const user = await User.findByIdAndUpdate(
      payment.userId,
      { isPaid: true },
      { new: true }
    );

    console.log(user)
    if (user) {
    const data = await  sendPaymentSuccess(user.phone, user.name, user._id).catch(console.error);
    console.log(data)
    }

    res.json({
      success: true,
      message: "Payment successful"
    });

  } catch (err) {
    console.error("Payment redirect error:", err);
    res.status(500).json({ success: false });
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
                .populate("payment")
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


exports.deactivateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (!user.verifiedByAdmin) {
            return res.status(400).json({
                success: false,
                message: "Profile is already inactive."
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                verifiedByAdmin: false,
                deactivatedAt: new Date(),
                deactivationReason: reason || "Deactivated by admin"
            },
            { new: true }
        ).select("-otp -otpExpires -otpAttempts");

        res.status(200).json({
            success: true,
            message: "Profile deactivated successfully.",
            data: updatedUser
        });
    } catch (err) {
        console.error("deactivateProfile error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to deactivate profile."
        });
    }
};


exports.reactivateProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.verifiedByAdmin) {
            return res.status(400).json({
                success: false,
                message: "Profile is already active."
            });
        }

        if (!user.isPaid) {
            return res.status(400).json({
                success: false,
                message: "Cannot activate profile because payment is not completed."
            });
        }

        if (!user.isMobileVerified) {
            return res.status(400).json({
                success: false,
                message: "Cannot activate profile because mobile is not verified."
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                verifiedByAdmin: true,
                deactivatedAt: null,
                deactivationReason: null
            },
            { new: true }
        ).select("-otp -otpExpires -otpAttempts");

        res.status(200).json({
            success: true,
            message: "Profile reactivated successfully.",
            data: updatedUser
        });
    } catch (err) {
        console.error("reactivateProfile error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to reactivate profile."
        });
    }
};


exports.adminUpdatePartner = async (req, res) => {
    const uploadedFiles = req.files || {};

    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            cleanupUploadedFiles(uploadedFiles);
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const {
            name,
            email,
            phone,
            category,
            description,
            city,
            state,
            address,

            facebook,
            instagram,
            youtube,
            website,
            whatsapp,

            experienceYears,
            languages,
            guideLicenseNumber,
            servicesOffered,

            officeName,
            officeAddress,
            services,
            rtoOfficeCode,

            shopName,
            shopAddress,
            accessoryTypes,

            garageName,
            garageAddress,
            mechanicExperience,
            specialization,

            isPaid,
            isMobileVerified,
            verifiedByAdmin,
            rating
        } = req.body;

        const parseArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return String(val)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        };

        // duplicate email/phone check
        if (email || phone) {
            const duplicateUser = await User.findOne({
                _id: { $ne: userId },
                $or: [
                    ...(email ? [{ email: email.trim().toLowerCase() }] : []),
                    ...(phone ? [{ phone: phone.trim() }] : [])
                ]
            });

            if (duplicateUser) {
                cleanupUploadedFiles(uploadedFiles);
                return res.status(409).json({
                    success: false,
                    message: "Email or phone is already in use by another user."
                });
            }
        }

        // normal fields
        if (name !== undefined) user.name = name.trim();
        if (email !== undefined) user.email = email.trim().toLowerCase();
        if (phone !== undefined) user.phone = phone.trim();
        if (category !== undefined) user.category = category;
        if (description !== undefined) user.description = description;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;
        if (address !== undefined) user.address = address;

        // social links
        user.socialLinks = {
            facebook: facebook !== undefined ? facebook : user.socialLinks?.facebook,
            instagram: instagram !== undefined ? instagram : user.socialLinks?.instagram,
            youtube: youtube !== undefined ? youtube : user.socialLinks?.youtube,
            website: website !== undefined ? website : user.socialLinks?.website,
            whatsapp: whatsapp !== undefined ? whatsapp : user.socialLinks?.whatsapp
        };

        // status fields
        if (isPaid !== undefined) user.isPaid = isPaid;
        if (isMobileVerified !== undefined) user.isMobileVerified = isMobileVerified;
        if (verifiedByAdmin !== undefined) user.verifiedByAdmin = verifiedByAdmin;
        if (rating !== undefined) user.rating = Number(rating);

        // category-specific
        const finalCategory = category || user.category;

        if (finalCategory === "tour_guide") {
            if (experienceYears !== undefined) user.experienceYears = Number(experienceYears);
            if (languages !== undefined) user.languages = parseArray(languages);
            if (guideLicenseNumber !== undefined) user.guideLicenseNumber = guideLicenseNumber;
            if (servicesOffered !== undefined) user.servicesOffered = parseArray(servicesOffered);
        }

        if (finalCategory === "rto_service") {
            if (officeName !== undefined) user.officeName = officeName;
            if (officeAddress !== undefined) user.officeAddress = officeAddress;
            if (services !== undefined) user.services = parseArray(services);
            if (rtoOfficeCode !== undefined) user.rtoOfficeCode = rtoOfficeCode;
        }

        if (finalCategory === "car_accessory") {
            if (shopName !== undefined) user.shopName = shopName;
            if (shopAddress !== undefined) user.shopAddress = shopAddress;
            if (accessoryTypes !== undefined) user.accessoryTypes = parseArray(accessoryTypes);
        }

        if (finalCategory === "car_mechanic") {
            if (garageName !== undefined) user.garageName = garageName;
            if (garageAddress !== undefined) user.garageAddress = garageAddress;
            if (mechanicExperience !== undefined) user.mechanicExperience = Number(mechanicExperience);
            if (specialization !== undefined) user.specialization = parseArray(specialization);
        }

        await user.save();

        const updatedUser = await User.findById(userId).select("-otp -otpExpires -otpAttempts");

        res.status(200).json({
            success: true,
            message: "Partner details updated successfully.",
            data: updatedUser
        });
    } catch (err) {
        cleanupUploadedFiles(uploadedFiles);
        console.error("adminUpdatePartner error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to update partner."
        });
    }
};


exports.deletePartner = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // optional: delete related payments too
        await Payment.deleteMany({ userId: user._id });

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "Partner deleted successfully."
        });
    } catch (err) {
        console.error("deletePartner error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to delete partner."
        });
    }
};

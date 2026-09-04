const TourGuideBookingPhase = require("../models/TourGuideBookingPhase");
const User = require("../models/User");
const {
    sendTourGuideRequest,
    sendCancelTourGuideBookingRequest,
    sendPaymentLink,
    sendTourGuideSecurityDepositLink,
    sendTourGuideSecurityDepositSuccess,
    sendTourGuideSecurityDepositExpired,
    sendPaymentSuccess
} = require("../utils/sendWhatsapp");
const {
    createSecurityDepositPaymentLink,
    invalidatePaymentLink,
    verifyWebhookSignature,
    fetchPaymentLink
} = require("../utils/paymentService");


exports.sendTourGuideBookingRequest = async (req, res) => {
    try {
        console.log("Received tour guide booking request:", req.body);
        const { driver_who_booked, secuirity_deposit, partnerId } = req.body;

        if (!driver_who_booked || !secuirity_deposit || !partnerId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const partner = await User.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ message: "Partner not found" });
        }

        const newBookingRequest = new TourGuideBookingPhase({
            driver_who_booked,
            secuirity_deposit,
            partnerId,
            status: "request_sent"
        });
        let messageSent = false;
        await newBookingRequest.save();
        try {

            // recipient (customerNumber) = partner.phone (WhatsApp jayega isi number par)
            // number (body placeholder) = driver ka number, jo message ke andar dikhna hai
            const result = await sendTourGuideRequest(
                partner.phone,
                partner.name,
                driver_who_booked.phone,
                secuirity_deposit,
                newBookingRequest._id.toString()
            );
            messageSent = true;
            console.log("WhatsApp message sent successfully:", result);

        } catch (err) {
            console.error("Error sending WhatsApp message:", err);
        }
        if (messageSent) {
            newBookingRequest.whatsappMessageSent = true;
            await newBookingRequest.save();
        }
        res.status(201).json({ message: "Tour guide booking request sent successfully", bookingRequest: newBookingRequest });

    } catch (error) {
        console.error("Error sending tour guide booking request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getMyTourGuideBookingRequests = async (req, res) => {
    try {
        const phone = req.params.phone;

        // Pagination
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 10, 1),
            100
        );

        const skip = (page - 1) * limit;

        const statusFilter = req.query.status;

        const completedStatuses = [
            "booking_confirmed",
            "booking_failed",
            "request_cancelled",
            "security_deposit_failed"
        ];

        const ongoingStatuses = [
            "pending",
            "request_sent",
            "security_deposit_paid"
        ];

        const query = {
            "driver_who_booked.phone": phone
        };

        if (statusFilter === "completed") {
            query.status = { $in: completedStatuses };
        } else if (statusFilter === "ongoing") {
            query.status = { $in: ongoingStatuses };
        }

        const total = await TourGuideBookingPhase.countDocuments(query);

        const bookingRequests = await TourGuideBookingPhase.find(query)
            .populate("partnerId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            count: bookingRequests.length,
            bookingRequests
        });

    } catch (error) {
        console.error("Error fetching tour guide booking requests:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.cancelTourGuideBookingRequest = async (req, res) => {
    try {
        const { phone, bookingId } = req.params;

        if (!phone || !bookingId) {
            return res.status(400).json({
                success: false,
                message: "Phone and booking ID are required"
            });
        }

        // BUG FIX: populate partnerId so we actually have partner.name/phone below.
        // Pehle `partner` variable defined hi nahi tha is scope mein.
        const bookingRequest = await TourGuideBookingPhase.findOne({
            _id: bookingId,
            "driver_who_booked.phone": phone
        }).populate("partnerId");

        if (!bookingRequest) {
            return res.status(404).json({
                success: false,
                message: "Booking request not found"
            });
        }

        const nonCancellableStatuses = [
            "booking_confirmed",
            "booking_failed",
            "request_cancelled",
            "security_deposit_failed"
        ];

        if (nonCancellableStatuses.includes(bookingRequest.status)) {
            return res.status(400).json({
                success: false,
                message: `Booking cannot be cancelled because its current status is ${bookingRequest.status}`
            });
        }

        // Agar payment link abhi active tha, use bhi invalidate kar do
        if (bookingRequest.paymentLinkId && bookingRequest.paymentLinkStatus === "active") {
            try {
                await invalidatePaymentLink(bookingRequest.paymentLinkId);
                bookingRequest.paymentLinkStatus = "invalidated";
            } catch (err) {
                console.error("Error invalidating payment link on cancel:", err.message);
            }
        }

        bookingRequest.status = "request_cancelled";
        await bookingRequest.save();

        const partner = bookingRequest.partnerId; // populated User doc
        // BUG FIX: `driver_who_booked` doesn't exist as a separate variable here —
        // it's embedded inside bookingRequest itself.
        const driver_who_booked = bookingRequest.driver_who_booked;

        try {
            // BUG FIX: this was shadowing Express's `res` (the response object)
            // with the WhatsApp API's response, which would have crashed
            // `res.status(200)` right below it. Renamed to `whatsappResult`.
            const whatsappResult = await sendCancelTourGuideBookingRequest(
                partner.phone,
                partner.name,
                driver_who_booked.name,
                driver_who_booked.phone,
                bookingRequest._id.toString()
            );
            console.log("Cancellation WhatsApp sent:", whatsappResult);
        } catch (err) {
            console.error("Error sending cancellation WhatsApp message:", err);
        }

        return res.status(200).json({
            success: true,
            message: "Tour guide booking request cancelled successfully",
            bookingRequest
        });

    } catch (error) {
        console.error("Error cancelling tour guide booking request:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getTourGuideBookingDetails = async (req, res) => {
    try {
        const { phone, bookingId } = req.params;

        if (!phone || !bookingId) {
            return res.status(400).json({
                success: false,
                message: "Phone and booking ID are required"
            });
        }

        const bookingRequest = await TourGuideBookingPhase.findOne({
            _id: bookingId,
            "driver_who_booked.phone": phone
        }).populate("partnerId");

        if (!bookingRequest) {
            return res.status(404).json({
                success: false,
                message: "Booking request not found"
            });
        }

        const completedStatuses = [
            "booking_confirmed",
            "booking_failed",
            "request_cancelled",
            "security_deposit_failed"
        ];

        const ongoingStatuses = [
            "pending",
            "request_sent",
            "security_deposit_paid"
        ];

        let statusCategory = "ongoing";

        if (completedStatuses.includes(bookingRequest.status)) {
            statusCategory = "completed";
        } else if (ongoingStatuses.includes(bookingRequest.status)) {
            statusCategory = "ongoing";
        }

        let paymentInfo = {
            generated: false,
            status: "not_generated",
            url: null,
            expiresAt: null,
            remainingSeconds: 0,
            remainingMinutes: 0,
            expired: false,
            paid: false
        };

        if (bookingRequest.paymentLinkId) {
            const now = Date.now();

            const expiresAt = bookingRequest.paymentLinkExpiresAt
                ? new Date(bookingRequest.paymentLinkExpiresAt).getTime()
                : null;

            let remainingSeconds = 0;

            if (
                expiresAt &&
                bookingRequest.paymentLinkStatus === "active"
            ) {
                remainingSeconds = Math.max(
                    Math.floor((expiresAt - now) / 1000),
                    0
                );
            }

            const timeExpired =
                expiresAt !== null && expiresAt <= now;

            const expired =
                bookingRequest.paymentLinkStatus === "expired" ||
                (
                    bookingRequest.paymentLinkStatus === "active" &&
                    timeExpired
                );

            paymentInfo = {
                generated: true,
                status: expired
                    ? "expired"
                    : bookingRequest.paymentLinkStatus,
                url: bookingRequest.paymentLinkUrl || null,
                expiresAt: bookingRequest.paymentLinkExpiresAt || null,
                remainingSeconds,
                remainingMinutes: Math.ceil(remainingSeconds / 60),
                expired,
                paid: bookingRequest.paymentLinkStatus === "paid"
            };
        }

        return res.status(200).json({
            success: true,
            booking: {
                id: bookingRequest._id,
                status: bookingRequest.status,
                statusCategory,

                createdAt: bookingRequest.createdAt,
                updatedAt: bookingRequest.updatedAt,

                driver: bookingRequest.driver_who_booked,

                partner: bookingRequest.partnerId,

                securityDeposit: bookingRequest.secuirity_deposit,

                whatsapp: {
                    requestSent:
                        bookingRequest.whatsappMessageSent || false,

                    paymentLinkSent:
                        bookingRequest.whatsappPaymentLinkMessageSent || false,

                    paymentSuccessSent:
                        bookingRequest.whatsappPaymentSuccessMessageSent || false
                },

                payment: paymentInfo,

                paymentId: bookingRequest.paymentId || null,

                paidAt: bookingRequest.paidAt || null
            }
        });
    } catch (error) {
        console.error(
            "Error fetching tour guide booking details:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
/**
 * Click pe payment link generate hoti hai (valid 1 hour), aur
 * tour guide (partner) ko WhatsApp par bhej di jaati hai security deposit
 * collect karne ke liye.
 */
exports.generateSecurityDepositPaymentLink = async (req, res) => {
    try {
        const { bookingId } = req.params;
        console.log("Generating payment link for bookingId:", bookingId);
        const bookingRequest = await TourGuideBookingPhase.findById(bookingId).populate("partnerId");

        if (!bookingRequest) {
            return res.status(404).json({ success: false, message: "Booking request not found" });
        }

        if (!["request_sent", "security_deposit_failed", "pending"].includes(bookingRequest.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot generate payment link when booking status is ${bookingRequest.status}`
            });
        }

        const partner = bookingRequest.partnerId;

        const link = await createSecurityDepositPaymentLink({
            amountInRupees: bookingRequest.secuirity_deposit,
            customerName: partner.name,
            customerPhone: partner.phone,
            referenceId: bookingRequest._id.toString()
        });

        bookingRequest.paymentLinkId = link.id;
        bookingRequest.paymentLinkUrl = link.shortUrl;
        bookingRequest.paymentLinkExpiresAt = link.expiresAt;
        bookingRequest.paymentLinkStatus = "active";
        await bookingRequest.save();

        try {
            await sendTourGuideSecurityDepositLink(
                partner.phone,
                partner.name,
                bookingRequest.secuirity_deposit,
                link.shortUrl,
                bookingRequest._id.toString()
            );
            bookingRequest.whatsappPaymentLinkMessageSent = true;
            await bookingRequest.save();
        } catch (err) {
            console.error("Error sending payment link WhatsApp message:", err);
        }

        return res.status(200).json({
            success: true,
            message: "Payment link generated and sent",
            paymentLinkUrl: link.shortUrl,
            expiresAt: link.expiresAt
        });

    } catch (error) {
        console.error("Error generating security deposit payment link:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Manually invalidate an active payment link (e.g. admin action, or
 * before regenerating a fresh one).
 */
exports.invalidateSecurityDepositPaymentLink = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const bookingRequest = await TourGuideBookingPhase.findById(bookingId);

        if (!bookingRequest) {
            return res.status(404).json({ success: false, message: "Booking request not found" });
        }

        if (!bookingRequest.paymentLinkId) {
            return res.status(400).json({ success: false, message: "No payment link exists for this booking" });
        }

        if (bookingRequest.paymentLinkStatus !== "active") {
            return res.status(400).json({
                success: false,
                message: `Payment link is already ${bookingRequest.paymentLinkStatus}`
            });
        }

        await invalidatePaymentLink(bookingRequest.paymentLinkId);

        bookingRequest.paymentLinkStatus = "invalidated";
        await bookingRequest.save();

        await sendTourGuideSecurityDepositExpired(
            bookingRequest.partnerId.phone,
            bookingRequest.partnerId.name,
            bookingRequest._id.toString()
        ).catch(err => {
            console.error("Error sending payment link expired WhatsApp message:", err);
        });

        return res.status(200).json({
            success: true,
            message: "Payment link invalidated successfully",
            bookingRequest
        });

    } catch (error) {
        console.error("Error invalidating payment link:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Razorpay webhook endpoint — payment_link.paid / payment_link.expired events.
 * Route must be mounted with raw body parsing (express.raw) for signature
 * verification to work — see note at the bottom of this file.
 */
exports.verifySecurityDepositPayment = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const isValid = verifyWebhookSignature(req.rawBody, signature);

        if (!isValid) {
            return res.status(400).send(renderHtmlPage({
                success: false,
                title: "Invalid Signature",
                message: "Webhook signature verification failed.",
                bookingId: "N/A"
            }));
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === "payment_link.paid") {
            const paymentLinkEntity = payload.payment_link.entity;
            const paymentEntity = payload.payment.entity;
            const bookingId = paymentLinkEntity.reference_id;

            const bookingRequest = await TourGuideBookingPhase.findById(bookingId).populate("partnerId");

            if (!bookingRequest) {
                console.error("Webhook: booking not found for payment link", paymentLinkEntity.id);
                return res.status(200).send(renderHtmlPage({
                    success: true,
                    title: "Payment Received",
                    message: "Payment processed successfully, but booking record was missing.",
                    bookingId: bookingId
                }));
            }

            if (bookingRequest.paymentLinkStatus === "paid") {
                return res.status(200).send(renderHtmlPage({
                    success: true,
                    title: "Booking Already Confirmed",
                    message: "This booking has already been marked as paid and confirmed.",
                    bookingId: bookingId
                }));
            }

            bookingRequest.paymentLinkStatus = "paid";
            bookingRequest.paymentId = paymentEntity.id;
            bookingRequest.paidAt = new Date();
            bookingRequest.status = "booking_confirmed";
            await bookingRequest.save();

            const partner = bookingRequest.partnerId;

            try {
                await sendTourGuideSecurityDepositSuccess(
                    partner.phone,
                    partner.name,
                    bookingRequest.secuirity_deposit,
                    bookingRequest._id.toString()
                );
                bookingRequest.whatsappPaymentSuccessMessageSent = true;
                await bookingRequest.save();
            } catch (err) {
                console.error("Error sending payment success WhatsApp message:", err);
            }

            // Render Success HTML Page for Browser View
            return res.status(200).send(renderHtmlPage({
                success: true,
                title: "Payment Successful!",
                message: "Your security deposit has been paid successfully and your booking is now confirmed.",
                bookingId: bookingId,
                amount: paymentLinkEntity.amount / 100
            }));
        }

        if (event === "payment_link.expired") {
            const paymentLinkEntity = payload.payment_link.entity;
            const bookingId = paymentLinkEntity.reference_id;

            const bookingRequest = await TourGuideBookingPhase.findById(bookingId);

            if (bookingRequest && bookingRequest.paymentLinkStatus === "active") {
                bookingRequest.paymentLinkStatus = "expired";
                bookingRequest.status = "security_deposit_failed";
                await bookingRequest.save();
            }

            return res.status(200).send(renderHtmlPage({
                success: false,
                title: "Payment Link Expired",
                message: "The security deposit payment link has expired. Please request a new link.",
                bookingId: bookingId
            }));
        }

        return res.status(200).send(renderHtmlPage({
            success: true,
            title: "Event Received",
            message: `Webhook event ${event} handled successfully.`,
            bookingId: "-"
        }));

    } catch (error) {
        console.error("Error verifying security deposit payment:", error);
        return res.status(500).send(renderHtmlPage({
            success: false,
            title: "Internal Server Error",
            message: "An unexpected error occurred while processing your payment verification.",
            bookingId: "N/A"
        }));
    }
};

// Helper function to generate clean responsive HTML pages
function renderHtmlPage({ success, title, message, bookingId, amount }) {
    const themeColor = success ? "#2e7d32" : "#d32f2f";
    const iconSymbol = success ? "✓" : "✕";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - TaxiSafar</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .card {
                background: #ffffff;
                width: 90%;
                max-width: 400px;
                padding: 30px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                text-align: center;
                border-top: 6px solid ${themeColor};
            }
            .icon-circle {
                width: 64px;
                height: 64px;
                border-radius: 32px;
                background-color: ${success ? '#e8f5e9' : '#ffebee'};
                color: ${themeColor};
                font-size: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px auto;
                font-weight: bold;
            }
            h1 {
                font-size: 22px;
                color: #222;
                margin-bottom: 10px;
            }
            p {
                font-size: 14px;
                color: #666;
                line-height: 20px;
                margin-bottom: 24px;
            }
            .details-box {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 24px;
                text-align: left;
                font-size: 13px;
                color: #444;
            }
            .details-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 6px;
            }
            .details-row:last-child {
                margin-bottom: 0;
            }
            .label {
                color: #777;
            }
            .value {
                font-weight: 600;
                color: #333;
            }
            .btn {
                display: inline-block;
                background-color: #d32f2f;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
                width: 100%;
                box-sizing: border-box;
            }
            .footer {
                margin-top: 20px;
                font-size: 11px;
                color: #aaa;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon-circle">${iconSymbol}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            
            <div class="details-box">
                <div class="details-row">
                    <span class="label">Booking ID:</span>
                    <span class="value">${bookingId}</span>
                </div>
                ${amount ? `
                <div class="details-row">
                    <span class="label">Amount Paid:</span>
                    <span class="value">₹${amount}</span>
                </div>` : ''}
            </div>

            <a href="taxisafar://app" class="btn">Return to TaxiSafar App</a>
            
            <div class="footer">TaxiSafar Secure Payments Powered by Razorpay</div>
        </div>
    </body>
    </html>
    `;
}

exports.checkAndSyncPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        console.log("Checking payment status for bookingId:", bookingId);

        const bookingRequest = await TourGuideBookingPhase.findById(bookingId).populate("partnerId");

        if (!bookingRequest) {
            return res.status(404).json({ success: false, message: "Booking request not found" });
        }

        // Kuch verify karne ko nahi agar link generate hi nahi hua ya already settled hai
        if (!bookingRequest.paymentLinkId || bookingRequest.paymentLinkStatus !== "active") {
            return res.status(200).json({
                success: true,
                synced: false,
                status: bookingRequest.paymentLinkStatus
            });
        }

        const remoteLink = await fetchPaymentLink(bookingRequest.paymentLinkId);
        let synced = false;

        if (remoteLink.status === "paid" && bookingRequest.paymentLinkStatus !== "paid") {
            const paidPayment = (remoteLink.payments || []).find(p => p.status === "captured") || {};

            bookingRequest.paymentLinkStatus = "paid";
            bookingRequest.paymentId = paidPayment.id || bookingRequest.paymentId;
            bookingRequest.paidAt = new Date();
            bookingRequest.status = "booking_confirmed";
            await bookingRequest.save();
            synced = true;

            const partner = bookingRequest.partnerId;
            if (partner && !bookingRequest.whatsappPaymentSuccessMessageSent) {
                try {
                    await sendTourGuideSecurityDepositSuccess(
                        partner.phone,
                        partner.name,
                        bookingRequest.secuirity_deposit,
                        bookingRequest._id.toString()
                    );
                    bookingRequest.whatsappPaymentSuccessMessageSent = true;
                    await bookingRequest.save();
                } catch (err) {
                    console.error("Error sending payment success WhatsApp message:", err);
                }
            }
        } else if (remoteLink.status === "expired" && bookingRequest.paymentLinkStatus === "active") {
            bookingRequest.paymentLinkStatus = "expired";
            bookingRequest.status = "security_deposit_failed";
            await bookingRequest.save();
            synced = true;
        }

        return res.status(200).json({
            success: true,
            synced,
            status: bookingRequest.paymentLinkStatus
        });

    } catch (error) {
        console.error("Error checking payment status:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const TourGuideBookingPhase = require("../models/TourGuideBookingPhase");
const User = require("../models/User");
const { sendTourGuideRequest } = require("../utils/sendWhatsapp");


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

            const res = await sendTourGuideRequest(
                partner.name,
                driver_who_booked.phone,
                secuirity_deposit,
                newBookingRequest._id.toString()
            );
            messageSent = true;
            console.log("WhatsApp message sent successfully:", res);

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
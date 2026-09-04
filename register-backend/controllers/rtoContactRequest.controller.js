const Agent = require("../models/User");
const RtoContactRequest = require("../models/RtoContactRequest.model");
const { sendRtoRequest } = require("../utils/sendWhatsapp");

exports.createContactRequest = async (req, res) => {
    try {
        const {
            agentId,
            type,
            contactNumber,
            guestName,
            guestPhone,
            source,
            userId
        } = req.body;

        console.log("createContactRequest body:", req.body);

        if (!agentId || !type) {
            return res.status(400).json({
                success: false,
                message: "agentId and type are required",
            });
        }

        if (!["call", "whatsapp"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "type must be either 'call' or 'whatsapp'",
            });
        }

        const agent = await Agent.findById(agentId).select("name phone");

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            });
        }

        // Check if same user contacted same agent
        // with same type within last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const existingRequest = await RtoContactRequest.findOne({
            agent: agentId,
            user: userId || null,
            type,
            createdAt: {
                $gte: fiveMinutesAgo
            }
        }).sort({
            createdAt: -1
        });

        // Duplicate request found
        // Don't create new record
        // Don't send WhatsApp again
        if (existingRequest) {
            console.log(
                "Duplicate request found within 5 minutes:",
                existingRequest._id
            );

            return res.status(200).json({
                success: true,
                message: "Request already sent recently. Please try again after 5 minutes.",
                duplicate: true,
                whatsappSent: false,
                data: existingRequest
            });
        }

        // Create new contact request
        const contactRequest = await RtoContactRequest.create({
            agent: agentId,
            user: userId || null,
            type,
            contactNumber: agent.phone,
            guestName: guestName || null,
            guestPhone: guestPhone || null,
            source: source || "rto_agent_details",
        });

        console.log(
            "Contact request created:",
            contactRequest._id
        );

        // Send WhatsApp notification only for new request
        try {
            const message = await sendRtoRequest(
                agent.phone,
                agent.name,
                guestName || "Guest",
                guestPhone || "N/A",
                type
            );

            console.log(
                "WhatsApp notification sent:",
                message
            );
        } catch (whatsappError) {
            console.error(
                "WhatsApp notification error:",
                whatsappError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Contact request saved",
            duplicate: false,
            whatsappSent: true,
            data: contactRequest,
        });

    } catch (error) {
        console.error(
            "createContactRequest error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Something went wrong while saving the contact request",
        });
    }
};

/**
 * GET /api/rto-agent/request/:agentId
 * Ek particular agent ke saare contact requests (latest first), with pagination
 */
exports.getAgentContactRequests = async (req, res) => {
    try {
        const { agentId } = req.params;
        const { page = 1, limit = 20, type } = req.query;

        if (!agentId) {
            return res.status(400).json({
                success: false,
                message: "agentId is required",
            });
        }

        const filter = { agent: agentId };
        if (type && ["call", "whatsapp"].includes(type)) {
            filter.type = type;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [requests, total] = await Promise.all([
            RtoContactRequest.find(filter)
                .populate("user", "name phone email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            RtoContactRequest.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: requests,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("getAgentContactRequests error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching contact requests",
        });
    }
};

/**
 * GET /api/rto-agent/request/user/me
 * Logged-in user ke saare contact requests (jin agents ko usne contact kiya)
 */
exports.getMyContactRequests = async (req, res) => {
    try {
        const userId = req.params._id

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const requests = await RtoContactRequest.find({ user: userId })
            .populate("agent")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error("getMyContactRequests error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching your requests",
        });
    }
};

/**
 * PATCH /api/rto-agent/request/:id/status
 * Body: { status: 'pending' | 'contacted' | 'closed' }
 * Agent/admin side se request ka status update karne ke liye
 */
exports.updateContactRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "contacted", "closed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const updated = await RtoContactRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Contact request not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated",
            data: updated,
        });
    } catch (error) {
        console.error("updateContactRequestStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating status",
        });
    }
};

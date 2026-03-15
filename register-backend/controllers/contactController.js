const User = require("../models/User");
const Contact = require("../models/conatctModel");
const { sendContactFormProvider } = require("../utils/sendWhatsapp");

exports.createContact = async (req, res) => {
  try {
    const { partnerId, name, phone, reason } = req.body;
    

    if (!partnerId || !name || !phone || !reason) {
      return res.status(200).json({
        success: false,
        message: "Please fill all required details and try again."
      });
    }

    const partner = await User.findById(partnerId);

    if (!partner) {
      return res.status(200).json({
        success: false,
        message: "This service provider is currently unavailable. Please try another provider."
      });
    }

    // Duplicate lead protection (5 minutes)
    const recentLead = await Contact.findOne({
      number: phone,
      providerId: partnerId,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (recentLead) {
      return res.status(200).json({
        success: false,
        message: "Your request was already sent recently. Please wait a moment."
      });
    }

    const contact = await Contact.create({
      name,
      number: phone,
      message: reason,
      providerId: partnerId
    });

    // WhatsApp notification
    try {
      const message = await sendContactFormProvider(
        partner.name,
        name,
        phone,
        reason,
        partner._id
      );
      console.log("message",message)

      if (message) {
        contact.WhatsAppNotificationSend = true;
        await contact.save();
      }
    } catch (err) {
      console.error("WhatsApp notification error:", err);
    }

    return res.status(200).json({
      success: true,
      message:
        "Thanks! Your request has been sent successfully. The service provider will contact you soon."
    });

  } catch (error) {

    console.error("Create Contact Error:", error);

    return res.status(200).json({
      success: false,
      message: "We couldn't send your request right now. Please try again."
    });
  }
};



// ======================================
// GET ALL CONTACTS (Admin / Provider)
// ======================================
exports.getAllContacts = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};

    if (req.query.providerId) {
      filter.providerId = req.query.providerId;
    }

    const contacts = await Contact.find(filter)
      .populate("providerId", "name number")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: contacts
    });

  } catch (error) {

    console.error("Get Contacts Error:", error);

    return res.status(200).json({
      success: false,
      message: "Unable to fetch contacts right now."
    });
  }
};



// ======================================
// GET SINGLE CONTACT
// ======================================
exports.getContactById = async (req, res) => {
  try {

    const contact = await Contact.findById(req.params.id)
      .populate("providerId", "name number");

    if (!contact) {
      return res.status(200).json({
        success: false,
        message: "Contact not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {

    console.error("Get Contact Error:", error);

    return res.status(200).json({
      success: false,
      message: "Unable to fetch contact details."
    });
  }
};



// ======================================
// UPDATE CONTACT
// ======================================
exports.updateContact = async (req, res) => {
  try {

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(200).json({
        success: false,
        message: "Contact not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully.",
      data: contact
    });

  } catch (error) {

    console.error("Update Contact Error:", error);

    return res.status(200).json({
      success: false,
      message: "Unable to update contact right now."
    });
  }
};



// ======================================
// DELETE CONTACT
// ======================================
exports.deleteContact = async (req, res) => {
  try {

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(200).json({
        success: false,
        message: "Contact not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully."
    });

  } catch (error) {

    console.error("Delete Contact Error:", error);

    return res.status(200).json({
      success: false,
      message: "Unable to delete contact right now."
    });
  }
};
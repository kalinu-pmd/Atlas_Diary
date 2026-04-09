import ContactMessage from "../models/contactMessage.js";
import { sendContactConfirmationEmail } from "../services/emailService.js";
import mongoose from "mongoose";

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }

    // Validate message length
    if (message.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 20 characters",
      });
    }

    // Create the contact message
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    await contactMessage.save();

    // Send confirmation email to user
    try {
        const emailSent = await sendContactConfirmationEmail(
          email.toLowerCase().trim(),
          name.trim(),
        );
      
      if (emailSent) {
        contactMessage.emailConfirmationSent = true;
        await contactMessage.save();
      }
    } catch (emailError) {
      console.error("[contactController] Failed to send confirmation email:", emailError);
      // Don't fail the request if email fails to send
    }

    return res.status(201).json({
      success: true,
      message: "Thank you for your message. We will contact you shortly!",
      data: {
        id: contactMessage._id,
        email: contactMessage.email,
        name: contactMessage.name,
      },
    });
  } catch (error) {
    console.error("[contactController] Error submitting message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit message. Please try again.",
      error: error.message,
    });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    // This endpoint is for admin - you may want to add auth middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactMessage.countDocuments();

    // Mark messages as read
    await ContactMessage.updateMany(
      { _id: { $in: messages.map((m) => m._id) } },
      { isReadByAdmin: true }
    );

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[contactController] Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

export const getUnreadContactMessageCount = async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({
      isReadByAdmin: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("[contactController] Error fetching unread count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

export const markContactMessageAsResolved = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message id is required",
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const message = await ContactMessage.findOneAndUpdate(
      query,
      { isResolved: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as resolved",
      data: message,
    });
  } catch (error) {
    console.error("[contactController] Error marking message as resolved:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update message",
      error: error.message,
    });
  }
};

export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message id is required",
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const message = await ContactMessage.findOneAndDelete(query);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("[contactController] Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

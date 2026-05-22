import ContactMessage from "../models/contactMessage.js";
import Notification from "../models/notification.js";
import User from "../models/users.js";
import {
  sendContactConfirmationEmail,
  sendSupportReplyEmail,
} from "../services/emailService.js";
import mongoose from "mongoose";

const requireAdmin = async (req, res) => {
  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const adminUser = await User.findById(req.userId).select("isAdmin name");
  if (!adminUser || !adminUser.isAdmin) {
    res.status(403).json({ message: "Admin access required" });
    return null;
  }

  return adminUser;
};

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message, attachment } = req.body;

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
      attachment: attachment || null,
      user: req.userId || undefined,
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

export const getMyContactMessages = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await ContactMessage.find({ user: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("[contactController] Error fetching user messages:", error);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;

    // This endpoint is for admin - you may want to add auth middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email");

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
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;

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
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;

    const { id } = req.params;
    const { message: adminMessage, closeTicket = true } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message id is required",
      });
    }

    const trimmedMessage = String(adminMessage || "").trim();
    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Admin message is required",
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const message = await ContactMessage.findOne(query);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.replies.push({
      sender: "admin",
      message: trimmedMessage,
      attachment: null,
      channels: { email: false, push: false },
    });
    message.isReadByAdmin = true;
    message.isResolved = Boolean(closeTicket);
    message.resolutionType = closeTicket ? "closed" : null;
    message.resolutionMessage = trimmedMessage;
    message.resolutionReason = null;
    message.resolvedAt = closeTicket ? new Date() : null;
    message.resolvedBy = closeTicket ? adminUser._id : null;

    await message.save();

    return res.status(200).json({
      success: true,
      message: closeTicket ? "Message marked as resolved" : "Reply saved",
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
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;

    const { id } = req.params;
    const { reason } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message id is required",
      });
    }

    const trimmedReason = String(reason || "").trim();
    if (!trimmedReason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const message = await ContactMessage.findOne(query);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.replies.push({
      sender: "admin",
      message: trimmedReason,
      attachment: null,
      channels: { email: false, push: false },
    });
    message.isReadByAdmin = true;
    message.isResolved = true;
    message.resolutionType = "deleted";
    message.resolutionReason = trimmedReason;
    message.resolutionMessage = trimmedReason;
    message.resolvedAt = new Date();
    message.resolvedBy = adminUser._id;

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message moved to resolved history",
      data: message,
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

export const replyToContactMessage = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { message, attachment } = req.body || {};

    if (!id) {
      return res.status(400).json({ message: "Message id is required" });
    }

    const trimmed = String(message || "").trim();
    if (!trimmed) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const contactMessage = await ContactMessage.findById(id);
    if (!contactMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (String(contactMessage.user || "") !== String(req.userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    contactMessage.replies.push({
      sender: "user",
      message: trimmed,
      attachment: attachment || null,
      channels: { email: false, push: false },
    });
    contactMessage.isReadByAdmin = false;
    await contactMessage.save();

    return res.status(200).json({ success: true, data: contactMessage });
  } catch (error) {
    console.error("[contactController] Error replying to message:", error);
    return res.status(500).json({ message: "Failed to reply to message" });
  }
};

export const adminReplyToContactMessage = async (req, res) => {
  try {
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) return;

    const { id } = req.params;
    const { message, channels, attachment } = req.body || {};

    const trimmed = String(message || "").trim();
    if (!trimmed) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const contactMessage = await ContactMessage.findById(id).populate("user", "name email");
    if (!contactMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    const channelFlags = {
      email: Boolean(channels?.email),
      push: Boolean(channels?.push),
    };

    contactMessage.replies.push({
      sender: "admin",
      message: trimmed,
      attachment: attachment || null,
      channels: channelFlags,
    });
    contactMessage.isReadByAdmin = true;
    await contactMessage.save();

    if (contactMessage.user) {
      try {
        await Notification.create({
          user: contactMessage.user,
          fromUser: adminUser._id,
          supportMessage: contactMessage._id,
          type: "support_reply",
        });
      } catch (notifyError) {
        console.error("Failed to create support reply notification:", notifyError);
      }
    }

    if (channelFlags.email && contactMessage.email) {
      await sendSupportReplyEmail({
        to: contactMessage.email,
        name: contactMessage.name,
        subject: contactMessage.subject,
        reply: trimmed,
      });
    }

    return res.status(200).json({ success: true, data: contactMessage });
  } catch (error) {
    console.error("[contactController] Error sending admin reply:", error);
    return res.status(500).json({ message: "Failed to send reply" });
  }
};

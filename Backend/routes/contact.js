import express from "express";
import {
  submitContactMessage,
  getMyContactMessages,
  getContactMessages,
  getUnreadContactMessageCount,
  markContactMessageAsResolved,
  deleteContactMessage,
  replyToContactMessage,
  adminReplyToContactMessage,
} from "../controllers/contact.js";
import auth, { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Submit contact message (public endpoint)
router.post("/submit", optionalAuth, submitContactMessage);

// User endpoints
router.get("/mine", auth, getMyContactMessages);
router.post("/:id/reply", auth, replyToContactMessage);

// Admin endpoints - Get all messages with pagination
router.get("/", auth, getContactMessages);

// Get unread message count
router.get("/unread-count", auth, getUnreadContactMessageCount);

// Mark message as resolved
router.patch("/:id/resolve", auth, markContactMessageAsResolved);

// Delete message
router.delete("/:id", auth, deleteContactMessage);

// Admin replies to a message
router.post("/:id/admin-reply", auth, adminReplyToContactMessage);

export default router;

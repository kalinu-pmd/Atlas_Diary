import express from "express";
import {
  submitContactMessage,
  getContactMessages,
  getUnreadContactMessageCount,
  markContactMessageAsResolved,
  deleteContactMessage,
} from "../controllers/contact.js";

const router = express.Router();

// Submit contact message (public endpoint)
router.post("/submit", submitContactMessage);

// Admin endpoints - Get all messages with pagination
router.get("/", getContactMessages);

// Get unread message count
router.get("/unread-count", getUnreadContactMessageCount);

// Mark message as resolved
router.patch("/:id/resolve", markContactMessageAsResolved);

// Delete message
router.delete("/:id", deleteContactMessage);

export default router;

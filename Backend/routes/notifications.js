import express from "express";
import auth from "../middleware/auth.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notifications.js";

const router = express.Router();

// All notification routes require auth
router.get("/", auth, getNotifications);
router.patch("/mark-all-read", auth, markAllNotificationsRead);
router.patch("/:id/read", auth, markNotificationRead);
router.delete("/:id", auth, deleteNotification);
router.delete("/", auth, clearNotifications);

export default router;

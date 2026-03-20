import Notification from "../models/notification.js";

// Get latest notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("fromUser", "name")
      .populate("post", "title");

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load notifications" });
  }
};

// Mark a single notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update notification" });
  }
};

// Mark all notifications as read for the current user
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.userId;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update notifications" });
  }
};

// Delete a single notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete notification" });
  }
};

// Delete all notifications for current user
export const clearNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    await Notification.deleteMany({ user: userId });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to clear notifications" });
  }
};

import { toast } from "react-toastify";
import * as api from "../api";
import {
  FETCH_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  CLEAR_NOTIFICATIONS,
} from "../constants/actionTypes";

export const getNotifications = () => async (dispatch) => {
  try {
    const { data } = await api.fetchNotifications();
    dispatch({ type: FETCH_NOTIFICATIONS, payload: data });
  } catch (error) {
    console.log("Error fetching notifications:", error);
  }
};

export const markNotificationAsRead = (id) => async (dispatch) => {
  try {
    const { data } = await api.markNotificationRead(id);
    dispatch({ type: MARK_NOTIFICATION_READ, payload: data });
  } catch (error) {
    console.log("Error marking notification read:", error);
  }
};

export const markAllNotificationsAsRead = () => async (dispatch) => {
  try {
    await api.markAllNotificationsRead();
    dispatch({ type: MARK_ALL_NOTIFICATIONS_READ });
  } catch (error) {
    console.log("Error marking all notifications read:", error);
    toast.error("Failed to update notifications");
  }
};

export const clearAllNotifications = () => async (dispatch) => {
  try {
    await api.clearNotifications();
    dispatch({ type: CLEAR_NOTIFICATIONS });
  } catch (error) {
    console.log("Error clearing notifications:", error);
    toast.error("Failed to clear notifications");
  }
};

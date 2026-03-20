import {
  FETCH_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  CLEAR_NOTIFICATIONS,
} from "../constants/actionTypes";

const initialState = {
  items: [],
  unreadCount: 0,
  loaded: false,
};

const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_NOTIFICATIONS: {
      const items = action.payload || [];
      const unreadCount = items.filter((n) => !n.read).length;
      return { ...state, items, unreadCount, loaded: true };
    }
    case MARK_NOTIFICATION_READ: {
      const items = state.items.map((n) =>
        n._id === action.payload._id ? action.payload : n
      );
      const unreadCount = items.filter((n) => !n.read).length;
      return { ...state, items, unreadCount };
    }
    case MARK_ALL_NOTIFICATIONS_READ: {
      const items = state.items.map((n) => ({ ...n, read: true }));
      return { ...state, items, unreadCount: 0 };
    }
    case CLEAR_NOTIFICATIONS: {
      return { ...state, items: [], unreadCount: 0 };
    }
    default:
      return state;
  }
};

export default notificationsReducer;

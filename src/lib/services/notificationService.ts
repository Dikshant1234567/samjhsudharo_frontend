// This is a mock implementation of a real-time notification service
// In a production environment, this would use WebSockets or Server-Sent Events

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'post' | 'system';
  read: boolean;
  createdAt: string;
  relatedId?: string;
  location?: string;
  date?: string;
  image?: string;
}

// Mock function to simulate receiving a notification
export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  console.log(`Subscribing to notifications for user ${userId}`);
  
  // Simulate receiving a notification after 5 seconds
  const timeout = setTimeout(() => {
    const mockNotification: Notification = {
      id: `notification-${Date.now()}`,
      title: 'New Event Near You',
      message: 'Join us for a tree plantation drive this weekend!',
      type: 'event',
      read: false,
      createdAt: new Date().toISOString(),
      relatedId: '105',
      location: 'Pune, Maharashtra',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString(), // 3 days from now
    };
    
    onNotification(mockNotification);
  }, 5000);
  
  // Return unsubscribe function
  return () => {
    console.log(`Unsubscribing from notifications for user ${userId}`);
    clearTimeout(timeout);
  };
};

// Notification slice for Redux
const initialState: {
  notifications: Notification[];
  unreadCount: number;
} = {
  notifications: [],
  unreadCount: 0
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    }
  }
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead,
  setNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
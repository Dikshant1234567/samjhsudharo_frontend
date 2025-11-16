'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { toggleNotificationDrawer } from '../../../lib/slices/modalSlice';
import { RootState } from '../../../lib/store';
import { subscribeToNotifications, addNotification } from '../../../lib/services/notificationService';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  useEffect(() => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    // Subscribe to notifications
    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      dispatch(addNotification(notification));
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png'
        });
      }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  const handleClick = () => {
    dispatch(toggleNotificationDrawer());
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
      aria-label="Notifications"
    >
      <Bell className="h-6 w-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
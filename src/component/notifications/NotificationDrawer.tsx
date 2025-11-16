'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Bell, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { toggleNotificationDrawer } from '../../lib/slices/modalSlice';
import { RootState } from '../../lib/store';

interface Notification {
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

export default function NotificationDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.modal.isNotificationDrawerOpen);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Mock data for development
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Event Near You',
          message: 'Beach Cleanup Drive happening this weekend at Juhu Beach.',
          type: 'event',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          relatedId: '101',
          location: 'Juhu Beach, Mumbai',
          date: '2023-08-15',
          image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: '2',
          title: 'Urgent Help Needed',
          message: 'Flood relief volunteers needed in Nagpur district.',
          type: 'post',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          relatedId: '102',
          location: 'Nagpur, Maharashtra'
        },
        {
          id: '3',
          title: 'Clean Earth NGO rated your contribution',
          message: 'Thank you for participating in our tree plantation drive!',
          type: 'system',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          relatedId: '103'
        },
        {
          id: '4',
          title: 'New Educational Workshop',
          message: 'Environmental awareness workshop for children this Sunday.',
          type: 'event',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          relatedId: '104',
          location: 'St. Mary\'s School, Mumbai',
          date: '2023-09-05'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // In a real implementation, this would make an API call
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real implementation, this would make an API call
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClose = () => {
    dispatch(toggleNotificationDrawer());
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button 
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Filters */}
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filter === 'all' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filter === 'unread' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Unread
                </button>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <Bell className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    {filter === 'all' 
                      ? 'No notifications yet' 
                      : 'No unread notifications'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-green-50' : ''}`}
                    >
                      <Link 
                        href={notification.relatedId ? (
                          notification.type === 'event' || notification.type === 'post'
                            ? `/post/${notification.relatedId}`
                            : `/profile/${notification.relatedId}`
                        ) : '#'}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex">
                          {notification.image ? (
                            <div className="relative h-12 w-12 rounded-md overflow-hidden mr-3 flex-shrink-0">
                              <Image 
                                src={notification.image} 
                                alt={notification.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`h-12 w-12 rounded-md mr-3 flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'event' 
                                ? 'bg-blue-100 text-blue-600' 
                                : notification.type === 'post'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              {notification.type === 'event' ? (
                                <Calendar className="h-6 w-6" />
                              ) : notification.type === 'post' ? (
                                <MapPin className="h-6 w-6" />
                              ) : (
                                <Bell className="h-6 w-6" />
                              )}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            
                            {(notification.location || notification.date) && (
                              <div className="mt-1 flex flex-wrap items-center text-xs text-gray-500">
                                {notification.location && (
                                  <div className="flex items-center mr-3">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{notification.location}</span>
                                  </div>
                                )}
                                
                                {notification.date && (
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{notification.date}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  
  return date.toLocaleDateString();
}

import React, { createContext, useContext, useState, useEffect, useReducer, useMemo } from 'react';
import { toast as sonnerToast } from "sonner";
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logUtils';

// Define notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  user_id?: string; // Added user_id as optional
}

// Define context state
interface NotificationContextState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showToasts: boolean;
  setShowToasts: (show: boolean) => void;
}

// Create the context
const NotificationContext = createContext<NotificationContextState | undefined>(undefined);

// Actions for reducer
type NotificationAction = 
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'INITIALIZE'; payload: Notification[] };

// Notifications reducer
const notificationsReducer = (state: Notification[], action: NotificationAction): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      // Limit to 20 notifications, removing oldest if needed
      const newState = [action.payload, ...state];
      return newState.slice(0, 20);
    
    case 'MARK_READ':
      return state.map(notification => 
        notification.id === action.payload 
          ? { ...notification, read: true } 
          : notification
      );
    
    case 'MARK_ALL_READ':
      return state.map(notification => ({ ...notification, read: true }));
    
    case 'REMOVE':
      return state.filter(notification => notification.id !== action.payload);
    
    case 'CLEAR_ALL':
      return [];
    
    case 'INITIALIZE':
      return action.payload;
    
    default:
      return state;
  }
};

// Generate a unique ID for notifications
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Helper function to convert Supabase notification type to our NotificationType
const validateNotificationType = (type: string | null): NotificationType => {
  if (type === 'success' || type === 'error' || type === 'info' || type === 'warning') {
    return type;
  }
  return 'info';
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationsReducer, []);
  const [showToasts, setShowToasts] = useState(false);
  const { user } = useAuth();

  // Calculate unread count using useMemo for better performance
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  // Load notifications from Supabase on mount and setup real-time subscription
  useEffect(() => {
    if (!user) return;

    logger.info("Setting up notifications system for user:", user.id);

    // Load initial notifications
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(20);

        if (error) {
          logger.error('Failed to load notifications from Supabase:', error);
          return;
        }

        if (data) {
          logger.info(`Loaded ${data.length} notifications from database`);
          const parsedNotifications: Notification[] = data.map(n => ({
            id: n.id,
            title: n.title,
            description: n.description || undefined,
            type: validateNotificationType(n.type),
            timestamp: new Date(n.timestamp),
            read: Boolean(n.read),
            user_id: n.user_id
          }));
          
          dispatch({ type: 'INITIALIZE', payload: parsedNotifications });
        }
      } catch (error) {
        logger.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Set up dedicated channel for real-time notification updates
    logger.info("Setting up real-time notification subscription");
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('Real-time notification received:', payload);
          
          try {
            // Create a new notification object from the payload
            const newNotification: Notification = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description || undefined,
              type: validateNotificationType(payload.new.type),
              timestamp: new Date(payload.new.timestamp),
              read: Boolean(payload.new.read),
              user_id: payload.new.user_id
            };
            
            logger.info(`Real-time notification received: ${newNotification.title}`);
            
            // Immediately update the UI with the new notification
            dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

            // If toast display is enabled, also show a toast
            if (showToasts) {
              switch (newNotification.type) {
                case 'success':
                  sonnerToast.success(newNotification.title, { description: newNotification.description });
                  break;
                case 'error':
                  sonnerToast.error(newNotification.title, { description: newNotification.description });
                  break;
                case 'warning':
                  sonnerToast.warning(newNotification.title, { description: newNotification.description });
                  break;
                case 'info':
                default:
                  sonnerToast.info(newNotification.title, { description: newNotification.description });
              }
            }
          } catch (error) {
            logger.error('Error processing real-time notification:', error);
          }
        }
      )
      .subscribe((status) => {
        logger.info(`Notification channel subscription status: ${status}`);
      });

    // Clean up subscription on unmount
    return () => {
      logger.info("Cleaning up notification channel subscription");
      supabase.removeChannel(channel);
    };
  }, [user, showToasts]);

  // Add a new notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!user) {
      logger.warn('Cannot add notification: No user logged in');
      return;
    }

    try {
      logger.info(`Adding new notification: ${notification.title}`);
      
      // Ensure notification type is valid
      const validType = validateNotificationType(notification.type);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            title: notification.title,
            description: notification.description,
            type: validType
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error('Failed to save notification to Supabase:', error);
        return;
      }

      // The real-time subscription will handle adding this to state
      logger.info('Notification added to database successfully');

      // Show as toast if enabled
      if (showToasts) {
        switch (validType) {
          case 'success':
            sonnerToast.success(notification.title, { description: notification.description });
            break;
          case 'error':
            sonnerToast.error(notification.title, { description: notification.description });
            break;
          case 'warning':
            sonnerToast.warning(notification.title, { description: notification.description });
            break;
          case 'info':
          default:
            sonnerToast.info(notification.title, { description: notification.description });
        }
      }
    } catch (error) {
      logger.error('Error adding notification:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Failed to mark notification as read:', error);
        return;
      }

      dispatch({ type: 'MARK_READ', payload: id });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // First, get all unread notification IDs
      const { data: unreadNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('read', false);

      if (fetchError) {
        logger.error('Failed to fetch unread notifications:', fetchError);
        return;
      }

      // If no unread notifications, nothing to do
      if (!unreadNotifications || unreadNotifications.length === 0) {
        logger.info('No unread notifications to mark as read');
        return;
      }

      // Update all unread notifications in the database
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (updateError) {
        logger.error('Failed to mark all notifications as read in database:', updateError);
        return;
      }

      // Update the local state
      dispatch({ type: 'MARK_ALL_READ' });
      logger.info(`Successfully marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
    }
  };

  // Remove a notification
  const removeNotification = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Failed to delete notification:', error);
        return;
      }

      dispatch({ type: 'REMOVE', payload: id });
    } catch (error) {
      logger.error('Error removing notification:', error);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        logger.error('Failed to clear all notifications:', error);
        return;
      }

      dispatch({ type: 'CLEAR_ALL' });
    } catch (error) {
      logger.error('Error clearing all notifications:', error);
    }
  };

  // Context value with memoized properties
  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    showToasts,
    setShowToasts
  }), [notifications, unreadCount, showToasts]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = (): NotificationContextState => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

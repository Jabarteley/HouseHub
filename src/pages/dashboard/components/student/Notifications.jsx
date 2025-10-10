import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import Icon from '../../../../components/AppIcon';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications') // Assuming a notifications table exists
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.code === 'PGRST205') {
        console.warn('Notifications table not found. Please run the migration to create the required tables.');
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6 animate-pulse">
        <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
          <div className="h-16 bg-secondary-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-text-secondary mt-1">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </p>
        )}
      </div>
      <div className="p-6">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`border border-border rounded-lg p-4 ${!notification.is_read ? 'bg-secondary-100' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        <Icon 
                          name={notification.type === 'booking' ? 'Calendar' : 
                                notification.type === 'message' ? 'MessageCircle' : 
                                notification.type === 'review' ? 'Star' : 
                                'Bell'}
                          size={20} 
                          className="text-text-secondary" 
                        />
                      </div>
                      <div>
                        <h4 className={`font-medium ${!notification.is_read ? 'text-text-primary font-semibold' : 'text-text-primary'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-text-secondary mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-tertiary mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-primary text-sm hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Bell" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No notifications yet</p>
            <p className="text-sm text-text-tertiary mt-2">
              You'll see updates about your property search here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
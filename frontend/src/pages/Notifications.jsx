import React from 'react';
import { useNotifications as useNotifContext } from '../context/NotificationContext';
import { Bell, Check, CheckCheck, Trash2, Clock } from 'lucide-react';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifContext();

  const handleMarkRead = (id) => {
    markAsRead(id);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'new_order':
        return '🛍️';
      case 'order_accepted':
        return '✅';
      case 'order_delivered':
        return '📦';
      case 'order_completed':
        return '🎉';
      case 'new_review':
        return '⭐';
      case 'new_message':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="py-6 space-y-6 max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inbox logs for order actions, ratings reviews, and real-time chat alerts.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300 dark:hover:bg-darkCard"
          >
            <CheckCheck className="h-4 w-4 mr-1 text-emerald-500" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-darkBorder dark:bg-darkCard overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <Bell className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-darkBorder">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-darkBg/10 transition-colors ${
                  !notif.is_read ? 'bg-brand-50/30 dark:bg-brand-950/10' : ''
                }`}
              >
                <div className="flex items-start space-x-3 pr-4">
                  <span className="text-xl flex-shrink-0 mt-0.5" role="img" aria-label="notification icon">
                    {getNotifIcon(notif.type)}
                  </span>
                  <div className="space-y-1">
                    <p className={`text-xs ${
                      !notif.is_read ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {notif.content}
                    </p>
                    <span className="text-[10px] text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(notif.created_at).toLocaleDateString()} at{' '}
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-emerald-500 dark:text-gray-500"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

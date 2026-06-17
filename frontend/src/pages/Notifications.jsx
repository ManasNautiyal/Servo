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
    <div className="py-6 space-y-6 max-w-3xl mx-auto px-4 text-brutal-charcoal dark:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase">
            Notifications
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Inbox logs for order actions, ratings reviews, and real-time chat alerts.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="brutal-btn-yellow flex items-center space-x-1.5 rounded-none px-4 py-2 text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1 stroke-[3]" />
            <span className="uppercase">Mark all read</span>
          </button>
        )}
      </div>

      <div className="rounded-none border-2 border-brutal-charcoal bg-white shadow-brutal-md dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-sm font-bold text-gray-500 dark:text-gray-400 space-y-3">
            <Bell className="h-12 w-12 mx-auto text-brutal-red bg-brutal-yellow border-2 border-brutal-charcoal p-2 shadow-brutal-sm rounded-none" />
            <p className="uppercase">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-brutal-charcoal dark:divide-white">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start justify-between p-5 transition-colors ${
                  !notif.is_read ? 'bg-brutal-yellow text-brutal-charcoal' : 'bg-white hover:bg-gray-50/50 dark:bg-darkCard dark:hover:bg-darkBg/10'
                }`}
              >
                <div className="flex items-start space-x-4 pr-4">
                  <span className="text-xl flex-shrink-0 mt-0.5" role="img" aria-label="notification icon">
                    {getNotifIcon(notif.type)}
                  </span>
                  <div className="space-y-1">
                    <p className={`text-xs font-bold ${
                      !notif.is_read ? 'text-brutal-charcoal' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notif.content}
                    </p>
                    <span className={`text-[10px] font-bold flex items-center ${
                      !notif.is_read ? 'text-gray-700' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      <Clock className="h-3 w-3 mr-1 stroke-[2.5]" />
                      {new Date(notif.created_at).toLocaleDateString()} at{' '}
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="rounded-none border-2 border-brutal-charcoal bg-white p-1.5 text-brutal-charcoal hover:bg-brutal-yellow hover:scale-105 active:scale-95 shadow-brutal-sm"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
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

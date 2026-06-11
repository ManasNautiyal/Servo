import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { Sun, Moon, Bell, MessageSquare, LogOut, User as UserIcon, LayoutDashboard, Sliders, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.svg';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { conversations } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const totalUnreadMessages = conversations.reduce((acc, curr) => acc + curr.unread_count, 0);

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    
    // Smart routing based on notification type
    if (notif.type.startsWith('order_') || notif.type === 'new_order') {
      navigate('/orders');
    } else if (notif.type === 'new_message') {
      navigate('/chat');
    } else {
      navigate('/notifications');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-darkBorder dark:bg-darkBg/80 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-4">
            {user && (
              <button 
                onClick={onMenuClick} 
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 lg:hidden dark:text-gray-400 dark:hover:bg-darkCard dark:hover:text-white"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Servo Logo" className="h-9 w-9" />
              <span className="font-sans text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                Servo
              </span>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-darkCard dark:hover:text-white"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* Chat Icon */}
                <Link
                  to="/chat"
                  className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-darkCard dark:hover:text-white"
                  title="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-darkBg">
                      {totalUnreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserDropdown(false);
                    }}
                    className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-darkCard dark:hover:text-white"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-darkBg">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl border border-gray-100 bg-white shadow-xl dark:border-darkBorder dark:bg-darkCard z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-darkBorder">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-darkBorder">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <button
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-darkBg transition-colors ${
                                  !notif.is_read ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''
                                }`}
                              >
                                <div className="flex-1">
                                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                    {notif.content}
                                  </p>
                                  <span className="text-[10px] text-gray-400 mt-1 block">
                                    {new Date(notif.created_at).toLocaleDateString()} at{' '}
                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                        <div className="border-t border-gray-100 bg-gray-50/50 p-2 text-center dark:border-darkBorder dark:bg-darkBg/50">
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 block w-full py-1"
                          >
                            View all notifications
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserDropdown(!showUserDropdown);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {user.profile_picture ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-100 dark:ring-brand-900"
                        src={user.profile_picture.startsWith('http') ? user.profile_picture : `${API_BASE_URL}${user.profile_picture}`}
                        alt={user.name}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 font-bold text-white ring-2 ring-brand-100 dark:ring-brand-900">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-xl dark:border-darkBorder dark:bg-darkCard z-50"
                      >
                        <div className="px-3 py-2 border-b border-gray-50 dark:border-darkBorder">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="mt-1 space-y-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-darkBg"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to={`/profile/${user.id}`}
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-darkBg"
                          >
                            <UserIcon className="h-4 w-4" />
                            <span>My Profile</span>
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/20"
                            >
                              <Sliders className="h-4 w-4" />
                              <span>Admin Panel</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              logout();
                            }}
                            className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-500 hover:shadow-brand-500/10 focus:outline-none dark:bg-brand-700 dark:hover:bg-brand-600 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

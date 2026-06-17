import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { Sun, Moon, Bell, MessageSquare, LogOut, User as UserIcon, LayoutDashboard, Sliders, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.svg';
import { API_BASE_URL } from '../services/api';

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
    <nav className="sticky top-0 z-40 w-full border-b-4 border-brutal-charcoal bg-white dark:border-white dark:bg-darkBg transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-4">
            {user && (
              <button 
                onClick={onMenuClick} 
                className="border-2 border-brutal-charcoal p-1.5 text-brutal-charcoal hover:bg-brutal-yellow focus:outline-none lg:hidden dark:text-white dark:border-white dark:hover:bg-brutal-charcoal"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white">
                Servo
              </span>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="border-2 border-brutal-charcoal p-1.5 text-brutal-charcoal hover:bg-brutal-yellow focus:outline-none dark:text-white dark:border-white dark:hover:bg-brutal-charcoal"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* Chat Icon */}
                <Link
                  to="/chat"
                  className="relative border-2 border-brutal-charcoal p-1.5 text-brutal-charcoal hover:bg-brutal-yellow focus:outline-none dark:text-white dark:border-white dark:hover:bg-brutal-charcoal"
                  title="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-none border border-brutal-charcoal bg-brutal-yellow text-[10px] font-bold text-brutal-charcoal">
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
                    className="relative border-2 border-brutal-charcoal p-1.5 text-brutal-charcoal hover:bg-brutal-yellow focus:outline-none dark:text-white dark:border-white dark:hover:bg-brutal-charcoal"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-none border border-brutal-charcoal bg-brutal-red text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-80 origin-top-right rounded-none border-2 border-brutal-charcoal bg-white shadow-brutal-md dark:border-white dark:bg-darkCard z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b-2 border-brutal-charcoal px-4 py-3 bg-brutal-yellow text-brutal-charcoal">
                          <span className="text-sm font-bold">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs font-bold underline hover:text-brutal-red"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-brutal-charcoal/20 dark:divide-white/20">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-brutal-charcoal dark:text-gray-400">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <button
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex w-full text-left p-3 hover:bg-brutal-yellow/10 dark:hover:bg-brutal-yellow/20 transition-colors ${
                                  !notif.is_read ? 'bg-brutal-yellow/5 dark:bg-brutal-yellow/10' : ''
                                }`}
                              >
                                <div className="flex-1">
                                  <p className="text-xs text-brutal-charcoal dark:text-gray-300 font-bold">
                                    {notif.content}
                                  </p>
                                  <span className="text-[10px] text-gray-500 mt-1 block">
                                    {new Date(notif.created_at).toLocaleDateString()} at{' '}
                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                        <div className="border-t-2 border-brutal-charcoal bg-white p-2 text-center dark:border-white dark:bg-darkBg/50">
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-xs font-bold text-brutal-charcoal dark:text-white hover:underline block w-full py-1"
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
                    className="flex items-center space-x-2 focus:outline-none border-2 border-brutal-charcoal p-0.5 bg-brutal-yellow dark:border-white"
                  >
                    {user.profile_picture ? (
                      <img
                        className="h-8 w-8 object-cover"
                        src={user.profile_picture.startsWith('http') ? user.profile_picture : `${API_BASE_URL}${user.profile_picture}`}
                        alt={user.name}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center font-extrabold text-brutal-charcoal text-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-56 origin-top-right rounded-none border-2 border-brutal-charcoal bg-white p-2 shadow-brutal-md dark:border-white dark:bg-darkCard z-50"
                      >
                        <div className="px-3 py-2 border-b-2 border-brutal-charcoal/20 dark:border-white/20 mb-2">
                          <p className="text-sm font-bold text-brutal-charcoal dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center space-x-2 rounded-none px-3 py-2 text-sm text-brutal-charcoal hover:bg-brutal-yellow dark:text-gray-300 dark:hover:bg-brutal-charcoal dark:hover:text-white transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="font-bold">Dashboard</span>
                          </Link>
                          <Link
                            to={`/profile/${user.id}`}
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center space-x-2 rounded-none px-3 py-2 text-sm text-brutal-charcoal hover:bg-brutal-yellow dark:text-gray-300 dark:hover:bg-brutal-charcoal dark:hover:text-white transition-colors"
                          >
                            <UserIcon className="h-4 w-4" />
                            <span className="font-bold">My Profile</span>
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserDropdown(false)}
                              className="flex items-center space-x-2 rounded-none px-3 py-2 text-sm text-brutal-red hover:bg-brutal-red/10 dark:text-red-400 dark:hover:bg-brutal-red dark:hover:text-white transition-colors"
                            >
                              <Sliders className="h-4 w-4" />
                              <span className="font-bold">Admin Panel</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              logout();
                            }}
                            className="flex w-full items-center space-x-2 rounded-none px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="font-bold">Log out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-bold text-brutal-charcoal hover:underline dark:text-gray-300 dark:hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="brutal-btn-yellow px-4 py-2 text-sm rounded-none"
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

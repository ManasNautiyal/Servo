import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Store, ClipboardList, Briefcase, MessageSquare, User, UserCog, Sliders, ShieldCheck } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Services', path: '/marketplace', icon: Store },
    { name: 'My Listings', path: '/my-services', icon: Briefcase },
    { name: 'My Orders', path: '/orders', icon: ClipboardList },
    { name: 'Chat Threads', path: '/chat', icon: MessageSquare },
    { name: 'My Profile', path: `/profile/${user.id}`, icon: User },
    { name: 'Edit Profile', path: '/edit-profile', icon: UserCog },
  ];

  const activeClass = "flex items-center space-x-3 rounded-lg bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-600 dark:bg-brand-950/20 dark:text-brand-400";
  const inactiveClass = "flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-darkCard dark:hover:text-white transition-all duration-200";

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-gray-200 bg-white px-4 py-6 dark:border-darkBorder dark:bg-darkBg lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div className="px-4 py-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Student Portal
              </span>
            </div>
            
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Admin Sidebar Section */}
          {user.role === 'admin' && (
            <div className="border-t border-gray-100 pt-4 dark:border-darkBorder">
              <NavLink
                to="/admin"
                onClick={onClose}
                className={location.pathname.startsWith('/admin') ? activeClass : inactiveClass}
              >
                <ShieldCheck className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Admin Panel</span>
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

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

  const activeClass = "flex items-center space-x-3 rounded-none bg-brutal-yellow border-2 border-brutal-charcoal px-4 py-3 text-sm font-bold text-brutal-charcoal shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:text-white";
  const inactiveClass = "flex items-center space-x-3 rounded-none border-2 border-transparent px-4 py-3 text-sm font-bold text-brutal-charcoal hover:bg-brutal-yellow/20 hover:border-brutal-charcoal dark:text-gray-300 dark:hover:bg-darkCard dark:hover:text-white dark:hover:border-white transition-all duration-150";

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-30 bg-brutal-charcoal/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r-4 border-brutal-charcoal bg-white px-4 py-6 dark:border-white dark:bg-darkBg lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div className="px-4 py-1">
              <span className="text-xs font-black uppercase tracking-widest text-brutal-charcoal dark:text-gray-400">
                Student Portal
              </span>
            </div>
            
            <nav className="space-y-2">
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
            <div className="border-t-2 border-brutal-charcoal/20 pt-4 dark:border-white/20">
              <NavLink
                to="/admin"
                onClick={onClose}
                className={location.pathname.startsWith('/admin') ? activeClass : inactiveClass}
              >
                <ShieldCheck className="h-5 w-5 text-brutal-red" />
                <span className="font-bold">Admin Panel</span>
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

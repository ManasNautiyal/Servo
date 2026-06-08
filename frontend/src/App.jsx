import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Marketplace from './pages/Marketplace';
import ServiceDetails from './pages/ServiceDetails';
import MyServices from './pages/MyServices';
import Orders from './pages/Orders';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ServiceManagement from './pages/ServiceManagement';

// Sub-component layout router to determine if Sidebar should render
const LayoutWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pages that should show the Sidebar if the user is authenticated
  const sidebarPaths = [
    '/dashboard',
    '/profile',
    '/edit-profile',
    '/marketplace',
    '/service',
    '/my-services',
    '/orders',
    '/chat',
    '/notifications',
    '/admin'
  ];

  const showSidebar = user && sidebarPaths.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-darkBg transition-colors duration-200">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className={`flex-1 p-4 lg:p-8 ${showSidebar ? 'lg:max-w-[calc(100vw-16rem)]' : 'max-w-7xl mx-auto w-full'}`}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Student Pages */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
            <Route path="/service/:id" element={
              <ProtectedRoute>
                <ServiceDetails />
              </ProtectedRoute>
            } />
            <Route path="/my-services" element={
              <ProtectedRoute>
                <MyServices />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />

            {/* Protected Admin Pages */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute requireAdmin>
                <ServiceManagement />
              </ProtectedRoute>
            } />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <LayoutWrapper />
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

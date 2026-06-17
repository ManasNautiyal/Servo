import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Briefcase, ClipboardCheck, Star, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch user profile statistics
      const statsRes = await api.get(`/api/users/stats/${user.id}`);
      setStats(statsRes.data);

      // Fetch user active orders
      const ordersRes = await api.get('/api/orders');
      setOrders(ordersRes.data.slice(0, 4));

      // Fetch AI recommendations
      const recsRes = await api.get('/api/services/recommendations');
      setRecommendations(recsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Visual order status pill mapping
  // Visual order status pill mapping in brutalist theme
  const getStatusBadge = (status) => {
    const statuses = {
      pending: 'bg-yellow-300 text-brutal-charcoal border-brutal-charcoal',
      accepted: 'bg-blue-300 text-brutal-charcoal border-brutal-charcoal',
      in_progress: 'bg-pink-300 text-brutal-charcoal border-brutal-charcoal',
      delivered: 'bg-purple-300 text-brutal-charcoal border-brutal-charcoal',
      completed: 'bg-emerald-300 text-brutal-charcoal border-brutal-charcoal',
      cancelled: 'bg-brutal-red text-white border-brutal-charcoal',
    };
    return `${statuses[status] || 'bg-gray-100 text-brutal-charcoal border-brutal-charcoal'} border-2 rounded-none px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider`;
  };

  return (
    <div className="space-y-8 py-6 text-brutal-charcoal">
      {/* Welcome banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase">
            Welcome back, {user.name}!
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Monitor listings, active tasks, and peer orders from your campus control center.
          </p>
        </div>
        <div>
          <Link
            to="/my-services"
            className="brutal-btn-yellow inline-flex items-center space-x-2 rounded-none px-5 py-2.5 text-sm"
          >
            <span>Create Listing</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards grid */}
      {stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Completed Orders */}
          <div className="flex items-center space-x-4 rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm">
            <div className="rounded-none border border-brutal-charcoal bg-emerald-300 p-3 text-brutal-charcoal">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Jobs Completed</p>
              <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white mt-1">{stats.orders_completed}</h3>
            </div>
          </div>

          {/* Card 2: Rating */}
          <div className="flex items-center space-x-4 rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm">
            <div className="rounded-none border border-brutal-charcoal bg-brutal-yellow p-3 text-brutal-charcoal">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Average Rating</p>
              <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white mt-1">
                {stats.average_rating > 0 ? `${stats.average_rating} / 5.0` : 'No reviews'}
              </h3>
            </div>
          </div>

          {/* Card 3: Reviews count */}
          <div className="flex items-center space-x-4 rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm">
            <div className="rounded-none border border-brutal-charcoal bg-pink-300 p-3 text-brutal-charcoal">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Reviews Received</p>
              <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white mt-1">{stats.reviews_received_count}</h3>
            </div>
          </div>

          {/* Card 4: Active Services */}
          <div className="flex items-center space-x-4 rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm">
            <div className="rounded-none border border-brutal-charcoal bg-blue-300 p-3 text-brutal-charcoal">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Active Listings</p>
              <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white mt-1">{stats.active_services_count}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Orders and AI suggestion columns */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-brutal-charcoal dark:text-white uppercase tracking-tight">Active Hires & Requests</h2>
            <Link to="/orders" className="text-xs font-black text-brutal-charcoal dark:text-white flex items-center hover:underline">
              <span>View all orders</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
          
          <div className="rounded-none border-2 border-brutal-charcoal bg-white shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-gray-500 dark:text-gray-400 bg-white">
                You do not have any active orders right now. Click "Browse Services" to hire someone!
              </div>
            ) : (
              <div className="divide-y-2 divide-brutal-charcoal/20 dark:divide-white/20 bg-white dark:bg-darkCard">
                {orders.map((order) => {
                  const isBuyer = order.buyer_id === user.id;
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-brutal-yellow/10 dark:hover:bg-brutal-yellow/20 transition-colors">
                      <div className="space-y-1">
                        <Link to={`/service/${order.service_id}`} className="text-sm font-black text-brutal-charcoal dark:text-white hover:underline block truncate max-w-xs sm:max-w-md">
                          {order.service?.title}
                        </Link>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {isBuyer ? `Hired: ${order.provider?.name}` : `Client: ${order.buyer?.name}`} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={getStatusBadge(order.status)}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <Link to="/orders" className="text-brutal-charcoal hover:underline dark:text-gray-300 dark:hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI helper banner card */}
        <div className="rounded-none border-4 border-brutal-charcoal bg-brutal-yellow p-6 shadow-brutal-md text-brutal-charcoal flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="inline-flex rounded-none border-2 border-brutal-charcoal bg-white p-2 text-brutal-charcoal shadow-brutal-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-2xl font-black uppercase tracking-tight">
              AI Profile Review
            </h3>
            <p className="text-xs font-bold leading-relaxed">
              Increase your hire potential! Our Gemini AI scans your skills, certificates, and description to point out missing keywords and provide portfolio suggestions.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to={`/profile/${user.id}`}
              className="brutal-btn-black flex items-center justify-center space-x-2 rounded-none px-4 py-2.5 text-xs shadow-none border-2 border-brutal-charcoal"
            >
              <span>Audit My Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-none border-2 border-brutal-charcoal bg-brutal-yellow p-1.5 text-brutal-charcoal shadow-brutal-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-black text-brutal-charcoal dark:text-white uppercase tracking-tight">
            AI Recommendations For You
          </h2>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-none border-2 border-dashed border-brutal-charcoal p-8 text-center text-sm font-bold text-gray-500 dark:border-white/20 dark:text-gray-400 bg-white">
            No customized recommendations available yet. Try updating your skills or branch in Edit Profile!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

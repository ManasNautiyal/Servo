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
  const getStatusBadge = (status) => {
    const statuses = {
      pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
      accepted: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
      in_progress: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
      delivered: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
      completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
      cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    };
    return statuses[status] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="space-y-8 py-6">
      {/* Welcome banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Welcome back, {user.name}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor listings, active tasks, and peer orders from your campus control center.
          </p>
        </div>
        <div>
          <Link
            to="/my-services"
            className="inline-flex items-center space-x-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 dark:bg-brand-700 dark:hover:bg-brand-600"
          >
            <span>Create Listing</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards grid */}
      {stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Completed Orders */}
          <div className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Jobs Completed</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.orders_completed}</h3>
            </div>
          </div>

          {/* Card 2: Rating */}
          <div className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Average Rating</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {stats.average_rating > 0 ? `${stats.average_rating} / 5.0` : 'No reviews'}
              </h3>
            </div>
          </div>

          {/* Card 3: Reviews count */}
          <div className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Reviews Received</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.reviews_received_count}</h3>
            </div>
          </div>

          {/* Card 4: Active Services */}
          <div className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Active Listings</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.active_services_count}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Orders and AI suggestion columns */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Hires & Requests</h2>
            <Link to="/orders" className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center hover:underline">
              <span>View all orders</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
          
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-darkBorder dark:bg-darkCard overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                You do not have any active orders right now. Click "Browse Services" to hire someone!
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-darkBorder">
                {orders.map((order) => {
                  const isBuyer = order.buyer_id === user.id;
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-darkBg/30">
                      <div className="space-y-1">
                        <Link to={`/service/${order.service_id}`} className="text-sm font-bold text-gray-900 dark:text-white hover:underline block truncate max-w-xs sm:max-w-md">
                          {order.service?.title}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isBuyer ? `Hired: ${order.provider?.name}` : `Client: ${order.buyer?.name}`} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                        <Link to="/orders" className="text-gray-400 hover:text-brand-500 dark:text-gray-500 dark:hover:text-white">
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
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-indigo-50 p-6 dark:border-brand-950/20 dark:from-brand-950/10 dark:to-indigo-950/10 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-brand-500 p-2 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-lg font-bold text-gray-900 dark:text-white">
              AI Profile Review
            </h3>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              Increase your hire potential! Our Gemini AI scans your skills, certificates, and description to point out missing keywords and provide portfolio suggestions.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center justify-center space-x-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-brand-700 shadow-sm border border-brand-100 hover:bg-brand-50 dark:bg-darkCard dark:border-darkBorder dark:text-white dark:hover:bg-darkBg transition-all"
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
          <div className="rounded-lg bg-brand-100 p-1.5 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            AI Recommendations For You
          </h2>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-darkBorder dark:text-gray-400">
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

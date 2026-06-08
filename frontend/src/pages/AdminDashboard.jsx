import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Briefcase, ClipboardList, Star, ShieldCheck, UserCheck, Trash } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl flex items-center">
            <ShieldCheck className="h-8 w-8 text-purple-600 mr-2" />
            Admin Command Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor registration metrics, active order pipelines, and moderate listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/services"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300"
          >
            Moderate Listings
          </Link>
        </div>
      </div>

      {analytics && (
        <div className="space-y-8">
          {/* Main Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* User count */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase">Total Users</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{analytics.users.total_users}</h3>
                <p className="text-[10px] text-gray-400 mt-1">
                  Active: {analytics.users.active_users} • New (7d): {analytics.users.new_users}
                </p>
              </div>
            </div>

            {/* Service Listings count */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase">Active Listings</span>
                <Briefcase className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{analytics.services.total_services}</h3>
                <p className="text-[10px] text-gray-400 mt-1">Across all student categories</p>
              </div>
            </div>

            {/* Orders Pipeline count */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase">Hiring Contracts</span>
                <ClipboardList className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{analytics.orders.total_orders}</h3>
                <p className="text-[10px] text-gray-400 mt-1">
                  Done: {analytics.orders.completed_orders} • Pending: {analytics.orders.pending_orders}
                </p>
              </div>
            </div>

            {/* Ratings Average */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase">Platform Rating</span>
                <Star className="h-5 w-5 text-amber-500 fill-current" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {analytics.reviews.average_rating > 0 ? `${analytics.reviews.average_rating} / 5.0` : 'None'}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Based on {analytics.reviews.total_reviews} student reviews</p>
              </div>
            </div>
          </div>

          {/* Sub category chart table */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">Services Categories Distribution</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
              {['Technical', 'Academic', 'Creative', 'Career', 'Other'].map(cat => {
                const count = analytics.services.categories[cat] || 0;
                return (
                  <div key={cat} className="bg-gray-50 rounded-lg p-3 text-center dark:bg-darkBg">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">{cat}</span>
                    <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 block mt-1">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

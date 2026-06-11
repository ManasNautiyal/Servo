import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Briefcase, ClipboardList, Star, ShieldCheck, UserCheck, Trash, Mail, Send, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Broadcast Email States
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post('/api/admin/broadcast-email', { subject, content });
      setMessage(res.data.message || 'Broadcast successfully initiated.');
      setSubject('');
      setContent('');
      setShowPreview(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send broadcast email.');
    } finally {
      setSending(false);
    }
  };

  const getFormattedPreview = (text) => {
    if (!text) return '<p class="text-gray-400 italic">No content typed yet. Type your message below to preview.</p>';
    return text
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${p.replace(/\n/g, '<br />')}</p>`)
      .join('');
  };


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

          {/* Broadcast Announcement Console */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-darkBorder pb-4">
              <Mail className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Broadcast Announcement Console</h3>
                <p className="text-xs text-gray-400">Send an email announcement to all registered users on the platform.</p>
              </div>
            </div>

            {message && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Important Updates Regarding Servo Services"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Message Body
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message here. Double line breaks create paragraphs."
                  rows="6"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300 transition-all flex items-center gap-1.5"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4" /> Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" /> Preview Email
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={!subject.trim() || !content.trim() || sending}
                  className="rounded-lg bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-700 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 ml-auto"
                >
                  <Send className="h-4 w-4" />
                  {sending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>

              {/* Live Preview Container */}
              {showPreview && (
                <div className="mt-6 p-6 rounded-xl border border-dashed border-purple-200 bg-purple-50/20 dark:border-purple-900/40 dark:bg-purple-950/10 space-y-4">
                  <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/50 pb-2">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Live Inbox Preview</span>
                    <span className="text-[10px] text-gray-400">Wraps message in Servo container template</span>
                  </div>
                  <div className="bg-white dark:bg-darkBg p-6 rounded-lg border border-gray-100 dark:border-darkBorder shadow-inner max-w-xl mx-auto">
                    <h1 className="text-xl font-extrabold text-purple-600 dark:text-purple-400 text-center mb-6 border-b pb-4 dark:border-darkBorder">
                      Message from Servo Admin
                    </h1>
                    <div 
                      className="text-sm prose dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: getFormattedPreview(content) }}
                    />
                    <div className="border-t border-gray-100 dark:border-darkBorder mt-6 pt-4 text-center text-[10px] text-gray-400">
                      <p>You received this email because you are a registered user of Servo.</p>
                      <p className="mt-1">Servo Marketplace © 2026</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Broadcast Delivery</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You are about to broadcast this announcement to <strong className="text-purple-600 dark:text-purple-400">{analytics.users.total_users}</strong> registered users.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
              <strong>Important:</strong> If you are using Resend Sandbox, emails will only deliver to your registered developer email address.
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-xs font-semibold border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5"
              >
                {sending ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminDashboard;

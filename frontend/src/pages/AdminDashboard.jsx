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
      .map(p => `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed font-bold">${p.replace(/\n/g, '<br />')}</p>`)
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
    <div className="py-6 space-y-8 max-w-5xl mx-auto px-4 text-brutal-charcoal dark:text-white">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase flex items-center">
            <ShieldCheck className="h-8 w-8 text-brutal-red mr-2 stroke-[3]" />
            Admin Command Center
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Monitor registration metrics, active order pipelines, and moderate listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="brutal-btn-yellow rounded-none px-4 py-2 text-xs uppercase"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/services"
            className="brutal-btn-yellow rounded-none px-4 py-2 text-xs uppercase"
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
            <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-3 text-brutal-charcoal dark:text-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</span>
                <Users className="h-5 w-5 text-brutal-red" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white">{analytics.users.total_users}</h3>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase">
                  Active: {analytics.users.active_users} • New (7d): {analytics.users.new_users}
                </p>
              </div>
            </div>

            {/* Service Listings count */}
            <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-3 text-brutal-charcoal dark:text-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Listings</span>
                <Briefcase className="h-5 w-5 text-brutal-red" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white">{analytics.services.total_services}</h3>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase">Across all student categories</p>
              </div>
            </div>

            {/* Orders Pipeline count */}
            <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-3 text-brutal-charcoal dark:text-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hiring Contracts</span>
                <ClipboardList className="h-5 w-5 text-brutal-red" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white">{analytics.orders.total_orders}</h3>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase">
                  Done: {analytics.orders.completed_orders} • Pending: {analytics.orders.pending_orders}
                </p>
              </div>
            </div>

            {/* Ratings Average */}
            <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-3 text-brutal-charcoal dark:text-white">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform Rating</span>
                <Star className="h-5 w-5 text-brutal-yellow fill-current text-brutal-charcoal" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-brutal-charcoal dark:text-white">
                  {analytics.reviews.average_rating > 0 ? `${analytics.reviews.average_rating} / 5.0` : 'None'}
                </h3>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase">Based on {analytics.reviews.total_reviews} reviews</p>
              </div>
            </div>
          </div>

          {/* Sub category distribution */}
          <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-4">
            <h3 className="text-sm font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Services Categories Distribution</h3>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              {['Technical', 'Academic', 'Creative', 'Career', 'Other'].map(cat => {
                const count = analytics.services.categories[cat] || 0;
                return (
                  <div key={cat} className="bg-brutal-yellow text-brutal-charcoal border-2 border-brutal-charcoal p-3 text-center shadow-brutal-sm rounded-none">
                    <span className="text-[10px] font-black uppercase block tracking-wider">{cat}</span>
                    <span className="text-xl font-black block mt-1">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Broadcast Announcement Console */}
          <div className="rounded-none border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-md dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-brutal-charcoal dark:border-white pb-4">
              <Mail className="h-6 w-6 text-brutal-red stroke-[2.5]" />
              <div>
                <h3 className="text-lg font-black text-brutal-charcoal dark:text-white uppercase tracking-tight">Broadcast Announcement Console</h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Send an email announcement to all registered users on the platform.</p>
              </div>
            </div>

            {message && (
              <div className="p-4 rounded-none bg-emerald-300 border-2 border-brutal-charcoal text-brutal-charcoal text-sm font-bold shadow-brutal-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-none bg-brutal-red border-2 border-brutal-charcoal text-white text-sm font-bold shadow-brutal-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Important Updates Regarding Servo Services"
                  className="w-full px-4 py-2.5 brutal-input rounded-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Message Body
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message here. Double line breaks create paragraphs."
                  rows="6"
                  className="w-full px-4 py-2.5 brutal-input rounded-none font-bold font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="brutal-btn-yellow rounded-none px-5 py-2.5 text-xs uppercase flex items-center gap-1.5"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 stroke-[3]" /> Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 stroke-[3]" /> Preview Email
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={!subject.trim() || !content.trim() || sending}
                  className="brutal-btn-black rounded-none px-5 py-2.5 text-xs uppercase text-white ml-auto disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 dark:bg-white dark:text-brutal-charcoal dark:border-brutal-charcoal"
                >
                  <Send className="h-4 w-4 stroke-[3]" />
                  {sending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>

              {/* Live Preview Container */}
              {showPreview && (
                <div className="mt-6 p-6 rounded-none border-2 border-dashed border-brutal-charcoal bg-brutal-yellow/10 dark:border-white space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-brutal-charcoal dark:border-white pb-2">
                    <span className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Live Inbox Preview</span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Wraps message in Servo container template</span>
                  </div>
                  <div className="bg-white dark:bg-darkBg p-6 rounded-none border-2 border-brutal-charcoal dark:border-white shadow-brutal-sm max-w-xl mx-auto text-brutal-charcoal dark:text-white">
                    <h1 className="text-xl font-black text-brutal-red dark:text-brutal-yellow text-center mb-6 border-b-2 border-brutal-charcoal dark:border-white pb-4 uppercase tracking-wider">
                      Message from Servo Admin
                    </h1>
                    <div 
                      className="text-sm prose dark:prose-invert font-bold"
                      dangerouslySetInnerHTML={{ __html: getFormattedPreview(content) }}
                    />
                    <div className="border-t-2 border-brutal-charcoal dark:border-white mt-6 pt-4 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brutal-charcoal/80 backdrop-blur-sm p-4">
          <div className="bg-white border-4 border-brutal-charcoal p-6 shadow-brutal-lg dark:bg-darkCard dark:border-white space-y-4 rounded-none text-brutal-charcoal dark:text-white max-w-md w-full">
            <h3 className="text-lg font-black uppercase tracking-tight">Confirm Broadcast Delivery</h3>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
              You are about to broadcast this announcement to <strong className="text-brutal-red dark:text-brutal-yellow">{analytics.users.total_users}</strong> registered users.
            </p>
            <div className="bg-brutal-yellow text-brutal-charcoal border-2 border-brutal-charcoal p-3 text-xs font-black uppercase shadow-brutal-sm">
              <strong>Important:</strong> If you are using Resend Sandbox, emails will only deliver to your registered developer email address.
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="brutal-btn-red rounded-none px-4 py-2 text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="brutal-btn-yellow rounded-none px-5 py-2 text-xs uppercase"
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

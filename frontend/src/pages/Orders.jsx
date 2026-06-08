import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Star, CheckCircle, ClipboardList, Clock, Check, X, AlertCircle, ShieldAlert, Award } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'
  
  // Review popup states
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewsStatus, setReviewsStatus] = useState({}); // orderId -> bool (reviewed)
  
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders');
      setOrders(res.data);
      
      // Look up existing reviews to verify which completed orders have already been rated
      const reviewsMap = {};
      for (const order of res.data) {
        if (order.status === 'completed') {
          try {
            const revRes = await api.get(`/api/reviews/service/${order.service_id}`);
            const reviewed = revRes.data.some(r => r.order_id === order.id);
            reviewsMap[order.id] = reviewed;
          } catch (e) {
            // ignore
          }
        }
      }
      setReviewsStatus(reviewsMap);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setError('');
    setActionLoading(true);
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update order status.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setError('');
    setActionLoading(true);

    try {
      await api.post('/api/reviews', {
        order_id: reviewOrder.id,
        rating: parseInt(rating),
        comment: comment.trim()
      });
      setReviewsStatus(prev => ({ ...prev, [reviewOrder.id]: true }));
      setReviewOrder(null);
      setComment('');
      setRating(5);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit review.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const buyingOrders = orders.filter((o) => o.buyer_id === user.id);
  const sellingOrders = orders.filter((o) => o.provider_id === user.id);
  const currentTabOrders = activeTab === 'buying' ? buyingOrders : sellingOrders;

  // Render 5 step timeline indicator
  const renderStepper = (currentStatus) => {
    const steps = ['pending', 'accepted', 'in_progress', 'delivered', 'completed'];
    const stepLabels = ['Requested', 'Accepted', 'In Progress', 'Delivered', 'Completed'];
    
    if (currentStatus === 'cancelled') {
      return (
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 px-3 py-1.5 rounded-lg w-max">
          <X className="h-4 w-4" />
          <span>ORDER CANCELLED / REJECTED</span>
        </div>
      );
    }

    const currentIndex = steps.indexOf(currentStatus);

    return (
      <div className="flex flex-wrap items-center gap-2 sm:gap-6 pt-2">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <React.Fragment key={step}>
              <div className="flex items-center space-x-1.5">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isDone 
                    ? 'bg-brand-600 text-white dark:bg-brand-500' 
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                } ${isCurrent ? 'ring-2 ring-brand-200' : ''}`}>
                  {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                </div>
                <span className={`text-[10px] font-semibold ${
                  isDone 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400'
                } ${isCurrent ? 'text-brand-600 dark:text-brand-400' : ''}`}>
                  {stepLabels[idx]}
                </span>
              </div>
              
              {idx < steps.length - 1 && (
                <div className={`hidden sm:block h-0.5 w-8 ${
                  idx < currentIndex ? 'bg-brand-600 dark:bg-brand-500' : 'bg-gray-200 dark:bg-gray-800'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-6 space-y-6 max-w-5xl mx-auto px-4">
      <div>
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Order Manager
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track hiring status and complete assignments with campus peers.
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs selectors */}
      <div className="flex border-b border-gray-200 dark:border-darkBorder">
        <button
          onClick={() => setActiveTab('buying')}
          className={`flex items-center space-x-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'buying'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-gray-400 hover:text-gray-950'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Hires (Buying)</span>
        </button>
        
        <button
          onClick={() => setActiveTab('selling')}
          className={`flex items-center space-x-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'selling'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-gray-400 hover:text-gray-950'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Requests (Selling)</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : currentTabOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500 bg-white dark:bg-darkCard dark:border-darkBorder">
          No orders found in this category.
        </div>
      ) : (
        <div className="space-y-6">
          {currentTabOrders.map((order) => {
            const isBuyer = activeTab === 'buying';
            const counterParty = isBuyer ? order.provider : order.buyer;
            const rate = order.service?.price;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-4"
              >
                {/* Header detail */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-50 pb-3 dark:border-darkBorder">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Order ID: #{order.id}</span>
                    <h3 className="text-sm font-bold text-gray-950 dark:text-white">{order.service?.title}</h3>
                    <p className="text-xs text-gray-500">
                      {isBuyer ? `Hired Provider: ` : `Hired By Client: `}
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{counterParty?.name}</span>
                      {counterParty && ` (Branch: ${counterParty.branch}, Year: ${counterParty.year})`}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm font-extrabold text-brand-700 dark:text-brand-400">₹{rate}</span>
                    <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress Timeline Stepper */}
                <div className="py-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Status Timeline</span>
                  {renderStepper(order.status)}
                </div>

                {/* Direct Action Triggers */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-gray-50 dark:border-darkBorder">
                  {/* Cancel pending buying order */}
                  {isBuyer && order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      disabled={actionLoading}
                      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* Provider Accept/Reject pending request */}
                  {!isBuyer && order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        disabled={actionLoading}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                      >
                        Reject Hire
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                        disabled={actionLoading}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 shadow-sm"
                      >
                        Accept Hire
                      </button>
                    </>
                  )}

                  {/* Provider Start Progress */}
                  {!isBuyer && order.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                      disabled={actionLoading}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      Start Work
                    </button>
                  )}

                  {/* Provider Deliver finished product */}
                  {!isBuyer && order.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      disabled={actionLoading}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
                    >
                      Deliver Finished Work
                    </button>
                  )}

                  {/* Buyer Approve/Complete delivery */}
                  {isBuyer && order.status === 'delivered' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      disabled={actionLoading}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      Complete & Approve Work
                    </button>
                  )}

                  {/* Buyer Leave review once completed */}
                  {isBuyer && order.status === 'completed' && !reviewsStatus[order.id] && (
                    <button
                      onClick={() => setReviewOrder(order)}
                      className="rounded-lg border border-brand-200 px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50"
                    >
                      Leave Review & Feedback
                    </button>
                  )}

                  {/* Completed placeholder indicator */}
                  {order.status === 'completed' && (
                    <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>ORDER COMPLETED</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal popup */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleReviewSubmit}
            className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-6 shadow-xl dark:bg-darkCard dark:border-darkBorder space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Award className="h-5 w-5 mr-1.5 text-brand-500" />
              Submit Service Review
            </h3>
            
            <p className="text-xs text-gray-500">
              Provide feedback for <span className="font-semibold">{reviewOrder.provider?.name}</span>'s work on: <span className="font-semibold">"{reviewOrder.service?.title}"</span>.
            </p>

            {/* Stars selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Rating Score</label>
              <div className="flex items-center space-x-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star className={`h-6 w-6 ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment details */}
            <div className="space-y-1">
              <label htmlFor="comment" className="text-xs font-bold text-gray-400 uppercase">Review Comment</label>
              <textarea
                id="comment"
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your experience: instructions accuracy, communication, and response time..."
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-500 disabled:opacity-75"
              >
                {actionLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Orders;

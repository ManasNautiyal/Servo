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
        <div className="flex items-center space-x-1.5 text-xs font-black text-white bg-brutal-red border-2 border-brutal-charcoal shadow-brutal-sm px-3 py-1.5 rounded-none w-max">
          <X className="h-4 w-4 stroke-[3]" />
          <span>ORDER CANCELLED / REJECTED</span>
        </div>
      );
    }

    const currentIndex = steps.indexOf(currentStatus);

    return (
      <div className="flex flex-wrap items-center gap-4 pt-2">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <React.Fragment key={step}>
              <div className="flex items-center space-x-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-none text-xs font-black border-2 border-brutal-charcoal shadow-brutal-sm ${
                  isDone 
                    ? 'bg-brutal-yellow text-brutal-charcoal' 
                    : 'bg-white text-gray-400 dark:bg-darkBg dark:border-white'
                } ${isCurrent ? 'ring-2 ring-brutal-red dark:ring-brutal-yellow' : ''}`}>
                  {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider ${
                  isDone 
                    ? 'text-brutal-charcoal dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                } ${isCurrent ? 'text-brutal-red dark:text-brutal-yellow underline' : ''}`}>
                  {stepLabels[idx]}
                </span>
              </div>
              
              {idx < steps.length - 1 && (
                <div className={`hidden sm:block h-1 w-8 border-y border-brutal-charcoal ${
                  idx < currentIndex ? 'bg-brutal-yellow' : 'bg-gray-200 dark:bg-gray-800'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-6 space-y-6 max-w-5xl mx-auto px-4 text-brutal-charcoal dark:text-white">
      <div>
        <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase">
          Order Manager
        </h1>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
          Track hiring status and complete assignments with campus peers.
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-none border-2 border-brutal-charcoal bg-brutal-red p-4 text-sm text-white shadow-brutal-sm font-bold">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs selectors */}
      <div className="flex border-2 border-brutal-charcoal bg-white dark:bg-darkCard p-1 rounded-none shadow-brutal-sm dark:shadow-brutal-dark-sm dark:border-white w-fit">
        <button
          onClick={() => setActiveTab('buying')}
          className={`flex items-center space-x-2 px-6 py-2.5 text-xs font-black transition-all rounded-none ${
            activeTab === 'buying'
              ? 'bg-brutal-yellow text-brutal-charcoal border-2 border-brutal-charcoal shadow-brutal-sm'
              : 'border-2 border-transparent text-gray-500 hover:text-brutal-charcoal dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4 stroke-[3]" />
          <span className="uppercase tracking-wider">Hires (Buying)</span>
        </button>
        
        <button
          onClick={() => setActiveTab('selling')}
          className={`flex items-center space-x-2 px-6 py-2.5 text-xs font-black transition-all rounded-none ${
            activeTab === 'selling'
              ? 'bg-brutal-yellow text-brutal-charcoal border-2 border-brutal-charcoal shadow-brutal-sm'
              : 'border-2 border-transparent text-gray-500 hover:text-brutal-charcoal dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="h-4 w-4 stroke-[3]" />
          <span className="uppercase tracking-wider">Requests (Selling)</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : currentTabOrders.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-brutal-charcoal p-12 text-center text-sm font-black text-gray-500 bg-white dark:bg-darkCard dark:border-white dark:text-gray-400 shadow-brutal-sm dark:shadow-brutal-dark-sm">
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
                className="rounded-none border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-4 text-brutal-charcoal dark:text-white"
              >
                {/* Header detail */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-brutal-charcoal pb-4 dark:border-white">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase">Order ID: #{order.id}</span>
                    <h3 className="text-lg font-black text-brutal-charcoal dark:text-white uppercase tracking-tight">{order.service?.title}</h3>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1">
                      {isBuyer ? `Hired Provider: ` : `Hired By Client: `}
                      <span className="font-black text-brutal-red dark:text-brutal-yellow">{counterParty?.name}</span>
                      {counterParty && ` (Branch: ${counterParty.branch}, Year: ${counterParty.year})`}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-lg font-black bg-brutal-yellow text-brutal-charcoal px-3 py-1 border-2 border-brutal-charcoal shadow-brutal-sm">₹{rate}</span>
                    <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress Timeline Stepper */}
                <div className="py-2">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-2">Status Timeline</span>
                  {renderStepper(order.status)}
                </div>

                {/* Direct Action Triggers */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t-2 border-brutal-charcoal dark:border-white">
                  {/* Cancel pending buying order */}
                  {isBuyer && order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      disabled={actionLoading}
                      className="brutal-btn-red rounded-none px-4 py-2 text-xs uppercase disabled:opacity-50"
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
                        className="brutal-btn-red rounded-none px-4 py-2 text-xs uppercase"
                      >
                        Reject Hire
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                        disabled={actionLoading}
                        className="brutal-btn-yellow rounded-none px-4 py-2 text-xs uppercase"
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
                      className="brutal-btn-yellow rounded-none px-4 py-2 text-xs uppercase"
                    >
                      Start Work
                    </button>
                  )}

                  {/* Provider Deliver finished product */}
                  {!isBuyer && order.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      disabled={actionLoading}
                      className="brutal-btn-yellow rounded-none px-4 py-2 text-xs uppercase"
                    >
                      Deliver Finished Work
                    </button>
                  )}

                  {/* Buyer Approve/Complete delivery */}
                  {isBuyer && order.status === 'delivered' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      disabled={actionLoading}
                      className="brutal-btn-yellow rounded-none px-4 py-2 text-xs uppercase"
                    >
                      Complete & Approve Work
                    </button>
                  )}

                  {/* Buyer Leave review once completed */}
                  {isBuyer && order.status === 'completed' && !reviewsStatus[order.id] && (
                    <button
                      onClick={() => setReviewOrder(order)}
                      className="brutal-btn-yellow rounded-none px-4 py-2 text-xs uppercase"
                    >
                      Leave Review & Feedback
                    </button>
                  )}

                  {/* Completed placeholder indicator */}
                  {order.status === 'completed' && (
                    <div className="flex items-center space-x-1.5 text-xs text-white bg-emerald-500 border-2 border-brutal-charcoal px-3 py-1.5 shadow-brutal-sm font-black uppercase">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brutal-charcoal/80 backdrop-blur-sm">
          <form
            onSubmit={handleReviewSubmit}
            className="w-full max-w-md bg-white border-4 border-brutal-charcoal p-6 shadow-brutal-lg dark:bg-darkCard dark:border-white space-y-4 rounded-none text-brutal-charcoal dark:text-white"
          >
            <h3 className="text-xl font-black uppercase flex items-center tracking-tight">
              <Award className="h-6 w-6 mr-1.5 text-brutal-red" />
              Submit Service Review
            </h3>
            
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Provide feedback for <span className="font-black text-brutal-red dark:text-brutal-yellow">{reviewOrder.provider?.name}</span>'s work on: <span className="font-semibold">"{reviewOrder.service?.title}"</span>.
            </p>

            {/* Stars selection */}
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Rating Score</label>
              <div className="flex items-center space-x-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star className={`h-8 w-8 border-2 border-brutal-charcoal p-1 shadow-brutal-sm dark:border-white ${star <= rating ? 'bg-brutal-yellow text-brutal-charcoal fill-current' : 'bg-white text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment details */}
            <div className="space-y-1">
              <label htmlFor="comment" className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Review Comment</label>
              <textarea
                id="comment"
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your experience: instructions accuracy, communication, and response time..."
                className="mt-1 block w-full brutal-input py-2.5 px-3 text-xs rounded-none font-bold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="brutal-btn-red rounded-none px-4 py-2.5 text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="brutal-btn-yellow rounded-none px-6 py-2.5 text-xs uppercase disabled:opacity-75"
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

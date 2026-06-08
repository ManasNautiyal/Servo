import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { Star, Clock, User, ShieldAlert, Check, MessageSquare, Briefcase, ExternalLink, GraduationCap } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ServiceCard from '../components/ServiceCard';

const ServiceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [providerStats, setProviderStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError('');
      // 1. Service Details
      const serviceRes = await api.get(`/api/services/${id}`);
      const sData = serviceRes.data;
      setService(sData);

      // 2. Provider Stats
      const statsRes = await api.get(`/api/users/stats/${sData.provider_id}`);
      setProviderStats(statsRes.data);

      // 3. Service Reviews
      const reviewsRes = await api.get(`/api/reviews/service/${id}`);
      setReviews(reviewsRes.data);

      // 4. Similar Services
      const allRes = await api.get('/api/services');
      const filteredSimilar = allRes.data.filter(
        (item) => item.category === sData.category && item.id !== sData.id
      ).slice(0, 3);
      setSimilar(filteredSimilar);

    } catch (err) {
      console.error('Failed to load service details:', err);
      setError('Service not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const handleHireSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setError('');
    setHiring(true);
    try {
      await api.post('/api/orders', { service_id: service.id });
      setSuccess(true);
      setTimeout(() => {
        setShowOrderModal(false);
        navigate('/orders');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to hire student. Please try again.';
      setError(msg);
    } finally {
      setHiring(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !service) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center text-red-500">
        <ShieldAlert className="h-12 w-12 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  const isOwnService = user && service.provider_id === user.id;

  const imgSource = service.image_url
    ? (service.image_url.startsWith('http') ? service.image_url : `${API_BASE_URL}${service.image_url}`)
    : 'https://images.unsplash.com/photo-1521737711867-e3b90473bd58?auto=format&fit=crop&q=80&w=800';

  const providerAvatar = service.provider?.profile_picture
    ? (service.provider.profile_picture.startsWith('http') ? service.provider.profile_picture : `${API_BASE_URL}${service.provider.profile_picture}`)
    : null;

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto px-4">
      {/* Detail grid columns */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Cover, Title, details description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-darkBorder dark:bg-darkCard">
            {/* Cover image */}
            <div className="relative pb-[50%] overflow-hidden bg-gray-100">
              <img src={imgSource} alt={service.title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <span className="inline-flex rounded-full bg-brand-50 border border-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/20 dark:border-brand-900/30 dark:text-brand-400">
                {service.category}
              </span>
              
              <h1 className="font-sans text-xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-2xl leading-snug">
                {service.title}
              </h1>

              {/* Delivery tag info */}
              <div className="flex items-center space-x-4 text-xs text-gray-400 border-y border-gray-50 py-3 dark:border-darkBorder dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.delivery_time} days average delivery</span>
                </div>
                <div>•</div>
                <span>Status: <span className="font-semibold uppercase text-brand-600 dark:text-brand-400">{service.status}</span></span>
              </div>

              {/* Long Description text */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">Service Overview</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-950 dark:text-white uppercase tracking-wider">Testimonials ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-darkBorder dark:text-gray-400 bg-white">
                No ratings left for this service yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 font-bold text-xs text-white">
                          {rev.reviewer?.name.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white block">{rev.reviewer?.name}</span>
                          <span className="text-[10px] text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic pl-1">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing CTA & Provider Profile summary */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Order Action card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-6">
            <div className="flex items-baseline justify-between border-b border-gray-50 pb-4 dark:border-darkBorder">
              <span className="text-sm font-semibold text-gray-400">Fixed Cost</span>
              <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">₹{service.price}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 text-brand-500" />
                <span>Ready to deliver in {service.delivery_time} days</span>
              </div>
            </div>

            {isOwnService ? (
              <Link
                to="/my-services"
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300"
              >
                Manage My Listing
              </Link>
            ) : (
              <div className="grid gap-3">
                <button
                  onClick={() => setShowOrderModal(true)}
                  disabled={service.status !== 'available'}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-500 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50"
                >
                  {service.status === 'available' ? 'Hire Peer Now' : 'Currently Busy'}
                </button>
                
                {user && (
                  <Link
                    to={`/chat?user=${service.provider_id}`}
                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300 dark:hover:bg-darkCard"
                  >
                    <MessageSquare className="h-4.5 w-4.5 mr-1.5" />
                    <span>Contact Provider</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Provider Card summary */}
          {service.provider && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Provider</h3>
              <div className="flex items-center space-x-3">
                {providerAvatar ? (
                  <img
                    src={providerAvatar}
                    alt={service.provider.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-100"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                    {service.provider.name.charAt(0)}
                  </div>
                )}
                <div>
                  <Link to={`/profile/${service.provider_id}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-500 flex items-center">
                    <span>{service.provider.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                  <span className="text-[10px] text-gray-400 flex items-center mt-0.5">
                    <GraduationCap className="h-3.5 w-3.5 mr-1" />
                    {service.provider.branch} • Year {service.provider.year}
                  </span>
                </div>
              </div>

              {service.provider.bio && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {service.provider.bio}
                </p>
              )}

              {providerStats && (
                <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-3 dark:border-darkBorder text-center">
                  <div>
                    <span className="block text-xs font-bold text-gray-900 dark:text-white">{providerStats.orders_completed}</span>
                    <span className="text-[9px] font-semibold text-gray-400 uppercase">Completed</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-900 dark:text-white flex items-center justify-center">
                      <Star className="h-3 w-3 text-amber-400 fill-current mr-0.5" />
                      {providerStats.average_rating > 0 ? providerStats.average_rating : 'None'}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400 uppercase">Rating Index</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Services list Row */}
      {similar.length > 0 && (
        <div className="space-y-6 border-t border-gray-100 pt-8 dark:border-darkBorder">
          <h2 className="text-lg font-bold text-gray-950 dark:text-white uppercase tracking-wider">
            Similar services you might like
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <ServiceCard key={item.id} service={item} />
            ))}
          </div>
        </div>
      )}

      {/* Hire Confirmation Modal overlay */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-6 shadow-xl dark:bg-darkCard dark:border-darkBorder space-y-4">
            
            {success ? (
              <div className="text-center py-6 space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Request Sent!</h3>
                <p className="text-xs text-gray-500">Your hire request has been submitted to the provider.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hire Service?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  You are initiating a peer-to-peer hire contract for the service: <span className="font-bold text-gray-700 dark:text-gray-300">"{service.title}"</span>. The provider will be notified to accept or decline the contract request.
                </p>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl dark:bg-darkBg">
                  <span className="text-xs font-semibold text-gray-500">Service Cost:</span>
                  <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">₹{service.price}</span>
                </div>
                
                {error && (
                  <div className="flex items-center space-x-1.5 text-xs text-red-600">
                    <ShieldAlert className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleHireSubmit}
                    disabled={hiring}
                    className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-500 disabled:opacity-75"
                  >
                    {hiring ? 'Sending...' : 'Confirm Order'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceDetails;

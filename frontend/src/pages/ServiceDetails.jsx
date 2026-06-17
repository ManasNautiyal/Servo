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
      <div className="max-w-xl mx-auto py-12 text-center text-white bg-brutal-red border-2 border-brutal-charcoal p-6 shadow-brutal-md font-bold">
        <ShieldAlert className="h-12 w-12 mx-auto mb-2 text-white" />
        <p className="uppercase tracking-wider">{error}</p>
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
    <div className="py-6 space-y-8 max-w-7xl mx-auto px-4 text-brutal-charcoal dark:text-white">
      {/* Detail grid columns */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Cover, Title, details description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-none border-2 border-brutal-charcoal bg-white shadow-brutal-md dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md">
            {/* Cover image */}
            <div className="relative pb-[50%] overflow-hidden bg-gray-100 border-b-2 border-brutal-charcoal dark:border-white">
              <img src={imgSource} alt={service.title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <span className="inline-flex rounded-none bg-brutal-yellow border-2 border-brutal-charcoal px-3 py-1 text-xs font-black text-brutal-charcoal shadow-brutal-sm">
                {service.category}
              </span>
              
              <h1 className="font-serif text-2xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase leading-snug">
                {service.title}
              </h1>

              {/* Delivery tag info */}
              <div className="flex items-center space-x-4 text-xs font-bold text-gray-500 border-y-2 border-brutal-charcoal py-3 dark:border-white dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 stroke-[3]" />
                  <span>{service.delivery_time} DAYS AVERAGE DELIVERY</span>
                </div>
                <div>•</div>
                <span>STATUS: <span className="font-black uppercase text-brutal-red dark:text-brutal-yellow">{service.status}</span></span>
              </div>

              {/* Long Description text */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Service Overview</h3>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials section */}
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Testimonials ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="rounded-none border-2 border-dashed border-brutal-charcoal p-8 text-center text-sm font-bold text-gray-500 dark:border-white dark:text-gray-400 bg-white dark:bg-darkCard">
                No ratings left for this service yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-brutal-charcoal bg-brutal-yellow font-black text-xs text-brutal-charcoal">
                          {rev.reviewer?.name.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="text-xs font-black text-brutal-charcoal dark:text-white block uppercase tracking-wide">{rev.reviewer?.name}</span>
                          <span className="text-[10px] font-bold text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current text-brutal-charcoal dark:text-brutal-yellow" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 italic pl-1">
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
          <div className="rounded-none border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-md dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md space-y-6">
            <div className="flex items-center justify-between border-b-2 border-brutal-charcoal pb-4 dark:border-white">
              <span className="text-xs font-black uppercase text-gray-500 dark:text-gray-400">Fixed Cost</span>
              <span className="text-2xl font-black bg-brutal-yellow text-brutal-charcoal px-3 py-1 border-2 border-brutal-charcoal shadow-brutal-sm">₹{service.price}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 text-brutal-red stroke-[3]" />
                <span>Ready to deliver in {service.delivery_time} days</span>
              </div>
            </div>

            {isOwnService ? (
              <Link
                to="/my-services"
                className="brutal-btn-yellow flex w-full items-center justify-center rounded-none py-3 text-xs"
              >
                <span>MANAGE MY LISTING</span>
              </Link>
            ) : (
              <div className="grid gap-3">
                <button
                  onClick={() => setShowOrderModal(true)}
                  disabled={service.status !== 'available'}
                  className="brutal-btn-yellow flex w-full items-center justify-center rounded-none py-3 text-xs"
                >
                  {service.status === 'available' ? 'HIRE PEER NOW' : 'CURRENTLY BUSY'}
                </button>
                
                {user && (
                  <Link
                    to={`/chat?user=${service.provider_id}`}
                    className="brutal-btn-black flex w-full items-center justify-center rounded-none py-3 text-xs text-white"
                  >
                    <MessageSquare className="h-4.5 w-4.5 mr-1.5 stroke-[3]" />
                    <span>CONTACT PROVIDER</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Provider Card summary */}
          {service.provider && (
            <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Service Provider</h3>
              <div className="flex items-center space-x-3">
                {providerAvatar ? (
                  <img
                    src={providerAvatar}
                    alt={service.provider.name}
                    className="h-12 w-12 rounded-none border-2 border-brutal-charcoal object-cover shadow-brutal-sm dark:border-white"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-brutal-charcoal bg-brutal-red font-black text-white shadow-brutal-sm dark:border-white">
                    {service.provider.name.charAt(0)}
                  </div>
                )}
                <div>
                  <Link to={`/profile/${service.provider_id}`} className="text-sm font-black text-brutal-red hover:underline uppercase tracking-wide flex items-center dark:text-brutal-yellow">
                    <span>{service.provider.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                    <GraduationCap className="h-3.5 w-3.5 mr-1 text-brutal-charcoal dark:text-white" />
                    {service.provider.branch} • YEAR {service.provider.year}
                  </span>
                </div>
              </div>

              {service.provider.bio && (
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {service.provider.bio}
                </p>
              )}

              {providerStats && (
                <div className="grid grid-cols-2 gap-2 border-t-2 border-brutal-charcoal pt-3 dark:border-white text-center">
                  <div>
                    <span className="block text-sm font-black text-brutal-charcoal dark:text-white">{providerStats.orders_completed}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase">Completed</span>
                  </div>
                  <div>
                    <span className="block text-sm font-black text-brutal-charcoal dark:text-white flex items-center justify-center">
                      <Star className="h-3.5 w-3.5 text-brutal-yellow fill-current text-brutal-charcoal mr-0.5" />
                      {providerStats.average_rating > 0 ? providerStats.average_rating : 'None'}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase">Rating Index</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar Services list Row */}
      {similar.length > 0 && (
        <div className="space-y-6 border-t-2 border-brutal-charcoal pt-8 dark:border-white">
          <h2 className="font-serif text-xl font-black uppercase tracking-tight text-brutal-charcoal dark:text-white">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brutal-charcoal/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-none border-4 border-brutal-charcoal p-6 shadow-brutal-lg dark:bg-darkCard dark:border-white space-y-4">
            
            {success ? (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none border-2 border-brutal-charcoal bg-emerald-300 text-brutal-charcoal shadow-brutal-sm p-3">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <h3 className="font-black text-xl uppercase tracking-tight text-brutal-charcoal dark:text-white">Request Sent!</h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Your hire request has been submitted to the provider.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-black uppercase tracking-tight text-brutal-charcoal dark:text-white">Hire Service?</h3>
                <p className="text-xs font-bold text-gray-500 leading-relaxed dark:text-gray-400">
                  You are initiating a peer-to-peer hire contract for the service: <span className="font-black text-brutal-red dark:text-brutal-yellow">"{service.title}"</span>. The provider will be notified to accept or decline the contract request.
                </p>
                <div className="flex justify-between items-center bg-brutal-yellow p-4 border-2 border-brutal-charcoal shadow-brutal-sm text-brutal-charcoal font-black rounded-none">
                  <span className="text-xs uppercase">Service Cost:</span>
                  <span className="text-lg font-black">₹{service.price}</span>
                </div>
                
                {error && (
                  <div className="flex items-center space-x-1.5 text-xs text-white bg-brutal-red p-3 border-2 border-brutal-charcoal shadow-brutal-sm font-black">
                    <ShieldAlert className="h-4 w-4 stroke-[3]" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="brutal-btn-red rounded-none px-4 py-2.5 text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleHireSubmit}
                    disabled={hiring}
                    className="brutal-btn-yellow rounded-none px-6 py-2.5 text-xs uppercase disabled:opacity-75"
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

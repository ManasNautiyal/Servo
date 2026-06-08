import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { Star, Mail, GraduationCap, FileText, Sparkles, Plus, AlertCircle, Edit, CheckCircle } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Github = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);

  const isOwner = user && parseInt(id) === user.id;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Fetch user profile
      const profRes = await api.get(`/api/users/profile/${id}`);
      setProfile(profRes.data);

      // Fetch user stats
      const statsRes = await api.get(`/api/users/stats/${id}`);
      setStats(statsRes.data);

      // Fetch user services
      const servicesRes = await api.get('/api/services');
      // Filter services offered by this provider
      const providerServices = servicesRes.data.filter(s => s.provider_id === parseInt(id));
      setServices(providerServices);

      // Fetch reviews received by this user
      const reviewsRes = await api.get(`/api/reviews/provider/${id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSuggestions = async () => {
    if (!isOwner) return;
    try {
      setLoadingAi(true);
      const res = await api.get('/api/users/suggestions');
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to fetch AI Suggestions:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  useEffect(() => {
    if (profile && isOwner) {
      fetchAiSuggestions();
    }
  }, [profile]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        User profile not found.
      </div>
    );
  }

  const avatarSource = profile.profile_picture
    ? (profile.profile_picture.startsWith('http') ? profile.profile_picture : `${API_BASE_URL}${profile.profile_picture}`)
    : null;

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      {/* Profile Header Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            {avatarSource ? (
              <img
                src={avatarSource}
                alt={profile.name}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-100 dark:ring-brand-950"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-3xl font-bold text-white ring-4 ring-brand-100 dark:ring-brand-950">
                {profile.name.charAt(0)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.name}</h1>
                {profile.role === 'admin' && (
                  <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200/40">
                    Staff
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 justify-center sm:justify-start">
                <GraduationCap className="h-4 w-4" />
                <span>{profile.branch} • Year {profile.year}</span>
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1 justify-center sm:justify-start">
                <Mail className="h-3.5 w-3.5" />
                <span>{profile.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {profile.github_link && (
              <a
                href={profile.github_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300 dark:hover:bg-darkCard"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            )}
            
            {profile.resume_url && (
              <a
                href={profile.resume_url.startsWith('http') ? profile.resume_url : `${API_BASE_URL}${profile.resume_url}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-darkBorder dark:bg-darkBg dark:text-gray-300 dark:hover:bg-darkCard"
              >
                <FileText className="h-4 w-4" />
                <span>Resume</span>
              </a>
            )}

            {isOwner && (
              <Link
                to="/edit-profile"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-500 dark:bg-brand-700 dark:hover:bg-brand-600"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </Link>
            )}

            {!isOwner && user && (
              <Link
                to={`/chat?user=${profile.id}`}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-500 dark:bg-brand-700 dark:hover:bg-brand-600"
              >
                <span>Contact Student</span>
              </Link>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 border-t border-gray-50 pt-4 dark:border-darkBorder">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Me</h4>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Profile columns */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Skills & Statistics */}
        <div className="space-y-8 lg:col-span-1">
          {/* Stats Summary */}
          {stats && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-4">
              <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">Work Records</h3>
              <div className="divide-y divide-gray-50 dark:divide-darkBorder">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-400">Completed Orders</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.orders_completed}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-400">Rating Index</span>
                  <span className="font-bold text-gray-900 dark:text-white flex items-center">
                    <Star className="h-4 w-4 text-amber-400 fill-current mr-1" />
                    {stats.average_rating > 0 ? stats.average_rating : 'None'}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-400">Services Online</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.active_services_count}</span>
                </div>
              </div>
            </div>
          )}

          {/* Skills pills */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">Skills & Domains</h3>
            {profile.skills.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No skills declared yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full bg-brand-50 border border-brand-100/50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/20 dark:border-brand-900/30 dark:text-brand-400"
                  >
                    {s.skill_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Services & Reviews & AI profile suggestions */}
        <div className="space-y-8 lg:col-span-2">
          {/* AI Auditing suggestions for OWN profile */}
          {isOwner && (
            <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-indigo-50/50 p-6 dark:border-brand-950/20 dark:from-brand-950/10 dark:to-indigo-950/10 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-sans text-base font-bold text-gray-900 dark:text-white">
                  Gemini AI Profile Optimizer
                </h3>
              </div>
              
              {loadingAi ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                </div>
              ) : suggestions ? (
                <div className="space-y-4 text-xs">
                  {/* Suggest Skills */}
                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Recommended Skills to Add:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.missing_skills?.map((sk, index) => (
                        <span key={index} className="flex items-center bg-white border border-brand-100 rounded-full px-2.5 py-1 text-brand-600 dark:bg-darkCard dark:border-darkBorder dark:text-brand-400">
                          <Plus className="h-3 w-3 mr-1" />
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggest Portfolio Items */}
                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Actionable Portfolio Tips:</span>
                    <ul className="list-disc pl-5 mt-2 space-y-1.5 text-gray-600 dark:text-gray-400">
                      {suggestions.portfolio_improvements?.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Better description suggest */}
                  {suggestions.better_service_description && (
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Suggested Professional Bio Summary:</span>
                      <blockquote className="mt-2 border-l-4 border-brand-300 bg-white/50 p-3 italic text-gray-600 rounded dark:border-brand-900 dark:bg-darkCard/50 dark:text-gray-400">
                        "{suggestions.better_service_description}"
                      </blockquote>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Provide skills or bio details to get automated optimizations from Gemini.</p>
              )}
            </div>
          )}

          {/* Active Services Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-950 dark:text-white uppercase tracking-wider">Services Offered</h2>
            {services.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-darkBorder dark:text-gray-400">
                This student has not created any service listings yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>

          {/* Reviews Received / Testimonials */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-950 dark:text-white uppercase tracking-wider">Student Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-darkBorder dark:text-gray-400">
                No reviews received yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-3">
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
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic pl-1 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

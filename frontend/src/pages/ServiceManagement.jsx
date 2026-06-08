import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, Search, Trash2, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDeleteService = async (serviceId, serviceTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete listing "${serviceTitle}"? This will cancel all pending orders for this service.`)) {
      return;
    }

    setError('');
    try {
      await api.delete(`/api/admin/services/${serviceId}`);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to moderate and delete service listing.';
      setError(msg);
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.provider?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-6 space-y-6 max-w-5xl mx-auto px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl flex items-center">
            <Briefcase className="h-8 w-8 text-indigo-600 mr-2" />
            Moderated Service Listings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Moderate and remove inappropriate, plagiarized, or policy-violating listings.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <ShieldAlert className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Roster Controls */}
      <div className="relative max-w-md bg-white rounded-xl border border-gray-100 shadow-sm dark:bg-darkCard dark:border-darkBorder">
        <input
          type="text"
          placeholder="Filter by title, category, or provider name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-4 pr-10 text-xs focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
        />
        <div className="absolute right-3 top-3 text-gray-400">
          <Search className="h-4.5 w-4.5" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-xl dark:bg-darkCard dark:border-darkBorder">
          No service listings match search filters.
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm dark:border-darkBorder dark:bg-darkCard">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-darkBorder text-xs text-left">
              <thead className="bg-gray-50 dark:bg-darkBg text-gray-400 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Service Listings</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price (INR)</th>
                  <th className="px-6 py-4">Provider Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-darkBorder/40">
                {filteredServices.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-darkBg/10">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      <div className="truncate max-w-[200px]">{item.title}</div>
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5 truncate max-w-[250px]">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.category}</td>
                    <td className="px-6 py-4 text-gray-950 dark:text-white font-semibold">₹{item.price}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.provider?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        item.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteService(item.id, item.title)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;

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
    <div className="py-6 space-y-6 max-w-5xl mx-auto px-4 text-brutal-charcoal dark:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase flex items-center">
            <Briefcase className="h-8 w-8 text-brutal-red mr-2 stroke-[3]" />
            Moderated Service Listings
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Moderate and remove inappropriate, plagiarized, or policy-violating listings.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-none border-2 border-brutal-charcoal bg-brutal-red p-4 text-sm text-white shadow-brutal-sm font-bold">
          <ShieldAlert className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Roster Controls */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Filter by title, category, or provider name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-2.5 pl-4 pr-10 text-xs brutal-input rounded-none font-bold"
        />
        <div className="absolute right-3 top-3 text-brutal-charcoal dark:text-white font-bold">
          <Search className="h-4.5 w-4.5 stroke-[2.5]" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-brutal-charcoal rounded-none dark:bg-darkCard dark:border-white font-bold uppercase tracking-wider shadow-brutal-sm">
          No service listings match search filters.
        </div>
      ) : (
        <div className="overflow-hidden bg-white border-2 border-brutal-charcoal rounded-none shadow-brutal-md dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md text-brutal-charcoal dark:text-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-brutal-charcoal dark:divide-white text-xs text-left">
              <thead className="bg-brutal-yellow text-brutal-charcoal font-black uppercase border-b-2 border-brutal-charcoal">
                <tr>
                  <th className="px-6 py-4">Service Listings</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price (INR)</th>
                  <th className="px-6 py-4">Provider Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-darkBorder/40">
                {filteredServices.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-darkBg/10 font-bold">
                    <td className="px-6 py-4 font-black">
                      <div className="truncate max-w-[200px] uppercase tracking-wide">{item.title}</div>
                      <div className="text-[10px] text-gray-500 font-bold mt-0.5 truncate max-w-[250px]">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4 text-brutal-red dark:text-brutal-yellow font-black">₹{item.price}</td>
                    <td className="px-6 py-4">{item.provider?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-none border-2 border-brutal-charcoal font-black uppercase text-[9px] shadow-brutal-sm ${
                        item.status === 'available' ? 'bg-emerald-300 text-brutal-charcoal' : 'bg-brutal-red text-white'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteService(item.id, item.title)}
                        className="rounded-none border-2 border-brutal-charcoal bg-brutal-red p-2 text-white hover:bg-red-700 shadow-brutal-sm transition-transform active:scale-95"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4.5 w-4.5 stroke-[2.5]" />
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

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, SlidersHorizontal, ArrowUpDown, Filter, X } from 'lucide-react';

const Marketplace = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // States for search and filter queries
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Mobile drawer filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (query.trim()) params.query = query.trim();
      if (category) params.category = category;
      if (branch.trim()) params.branch = branch.trim();
      if (year) params.year = parseInt(year);
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);
      if (sortBy) params.sort_by = sortBy;

      const res = await api.get('/api/services', { params });
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch marketplace services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when variables edit
  useEffect(() => {
    fetchServices();
  }, [category, sortBy]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchServices();
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setQuery('');
    setCategory('');
    setBranch('');
    setYear('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    // We update this manually
    setTimeout(fetchServices, 0);
  };

  const categories = ['Technical', 'Academic', 'Creative', 'Career', 'Other'];

  return (
    <div className="py-6 space-y-6 max-w-7xl mx-auto px-4">
      {/* Header bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Campus Marketplace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hire peer student experts or collaborate on campus services.
          </p>
        </div>
      </div>

      {/* Search and Sort controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm dark:bg-darkCard dark:border-darkBorder">
        {/* Search Input */}
        <form onSubmit={handleApplyFilters} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by keywords, tags, or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-4 pr-10 text-sm focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
          />
          <button type="submit" className="absolute right-3 top-3 text-gray-400 hover:text-brand-500">
            <Search className="h-4.5 w-4.5" />
          </button>
        </form>

        <div className="flex items-center gap-3 justify-end">
          {/* Sorting */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-gray-700 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
            >
              <option value="newest">Newest Listings</option>
              <option value="popularity">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>

          {/* Filter toggle button for smaller displays */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 lg:hidden dark:border-darkBorder dark:bg-darkBg dark:text-gray-300 dark:hover:bg-darkCard"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Filters for Desktop */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <form onSubmit={handleApplyFilters} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3 dark:border-darkBorder">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center">
                <Filter className="h-4 w-4 mr-1.5 text-brand-500" />
                Refine Search
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-gray-400 hover:text-brand-500"
              >
                Reset
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg ${
                    !category ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-darkBg'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg ${
                      category === cat ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-darkBg'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <label htmlFor="branch" className="text-xs font-bold text-gray-400 uppercase">Provider Branch</label>
              <input
                id="branch"
                type="text"
                placeholder="e.g. Computer Science"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label htmlFor="year" className="text-xs font-bold text-gray-400 uppercase">Provider Year</label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
              </select>
            </div>

            {/* Price limits */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Price Budget (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-500 dark:bg-brand-700 dark:hover:bg-brand-600"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Listings Display Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner />
          ) : services.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-xl dark:bg-darkCard dark:border-darkBorder">
              <p className="text-sm text-gray-500 dark:text-gray-400">No services match your search preferences. Try relaxing the filter choices!</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-xs font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Slide for Filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div onClick={() => setShowMobileFilters(false)} className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />

          {/* Drawer contents */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl dark:bg-darkCard">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100 dark:border-darkBorder">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">Filter Options</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="p-4 space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Provider Branch</label>
                <input
                  type="text"
                  placeholder="Computer Science"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg"
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Provider Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg"
                >
                  <option value="">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>

              {/* Price limits */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Budget Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs focus:outline-none dark:border-darkBorder dark:bg-darkBg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-darkBorder">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-500"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

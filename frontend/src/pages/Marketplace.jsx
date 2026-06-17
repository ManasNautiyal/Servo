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
    <div className="py-6 space-y-6 max-w-7xl mx-auto px-4 text-brutal-charcoal">
      {/* Header bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase">
            Campus Marketplace
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Hire peer student experts or collaborate on campus services.
          </p>
        </div>
      </div>

      {/* Search and Sort controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-none border-2 border-brutal-charcoal shadow-brutal-sm dark:bg-darkCard dark:border-white dark:shadow-brutal-dark-sm">
        {/* Search Input */}
        <form onSubmit={handleApplyFilters} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by keywords, tags, or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:border-white dark:bg-darkBg dark:text-white dark:focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
          />
          <button type="submit" className="absolute right-3 top-3.5 text-brutal-charcoal hover:text-brutal-red dark:text-white">
            <Search className="h-4.5 w-4.5" />
          </button>
        </form>

        <div className="flex items-center gap-3 justify-end">
          {/* Sorting */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-brutal-charcoal dark:text-white" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm rounded-none border-2 border-brutal-charcoal bg-white py-2 px-3 text-brutal-charcoal font-bold focus:outline-none dark:border-white dark:bg-darkBg dark:text-white"
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
            className="flex items-center space-x-1.5 rounded-none border-2 border-brutal-charcoal bg-white px-4 py-2 text-sm font-bold text-brutal-charcoal hover:bg-brutal-yellow lg:hidden dark:border-white dark:bg-darkBg dark:text-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Filters for Desktop */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <form onSubmit={handleApplyFilters} className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-6">
            <div className="flex items-center justify-between border-b-2 border-brutal-charcoal pb-3 dark:border-white/20">
              <span className="text-sm font-black text-brutal-charcoal dark:text-white uppercase tracking-wider flex items-center">
                <Filter className="h-4 w-4 mr-1.5 text-brutal-red" />
                Refine Search
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-black text-gray-500 hover:underline hover:text-brutal-red"
              >
                Reset
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Category</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-none border-2 transition-all ${
                    !category 
                      ? 'bg-brutal-yellow text-brutal-charcoal border-brutal-charcoal shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' 
                      : 'border-transparent text-gray-600 hover:bg-brutal-yellow/20 hover:border-brutal-charcoal dark:text-gray-300 dark:hover:bg-darkBg'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-none border-2 transition-all ${
                      category === cat 
                        ? 'bg-brutal-yellow text-brutal-charcoal border-brutal-charcoal shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' 
                        : 'border-transparent text-gray-600 hover:bg-brutal-yellow/20 hover:border-brutal-charcoal dark:text-gray-300 dark:hover:bg-darkBg'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <label htmlFor="branch" className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Provider Branch</label>
              <input
                id="branch"
                type="text"
                placeholder="e.g. Computer Science"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg dark:text-white"
              />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label htmlFor="year" className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Provider Year</label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg dark:text-white"
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
              <label className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Price Budget (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full brutal-btn-yellow py-2.5 text-xs rounded-none"
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
            <div className="text-center py-16 bg-white border-2 border-brutal-charcoal rounded-none dark:bg-darkCard dark:border-white shadow-brutal-sm">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No services match your search preferences. Try relaxing the filter choices!</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-xs font-black text-brutal-red hover:underline"
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
          <div onClick={() => setShowMobileFilters(false)} className="fixed inset-0 bg-brutal-charcoal/40 backdrop-blur-sm" />

          {/* Drawer contents */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 border-l-4 border-brutal-charcoal dark:bg-darkCard dark:border-white">
            <div className="flex items-center justify-between px-4 pb-4 border-b-2 border-brutal-charcoal dark:border-white">
              <span className="text-sm font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Filter Options</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-brutal-charcoal dark:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="p-4 space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <label className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Provider Branch</label>
                <input
                  type="text"
                  placeholder="Computer Science"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg"
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Provider Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg"
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
                <label className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Budget Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-none border-2 border-brutal-charcoal bg-white py-2 px-3 text-xs font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-brutal-charcoal dark:border-white">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 rounded-none border-2 border-brutal-charcoal py-2.5 text-xs font-bold text-brutal-charcoal hover:bg-gray-100"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="flex-1 brutal-btn-yellow py-2.5 text-xs rounded-none"
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

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, Code, GraduationCap, Palette, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Landing = () => {
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/services');
        setFeatured(res.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const categories = [
    { name: 'Technical', desc: 'Coding, projects, APIs', icon: Code, color: 'from-blue-500 to-indigo-600' },
    { name: 'Academic', desc: 'Tutoring, assignments', icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
    { name: 'Creative', desc: 'Logos, video edits, flyers', icon: Palette, color: 'from-purple-500 to-pink-600' },
    { name: 'Career', desc: 'Resumes, LinkedIn prep', icon: FileText, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gray-50 dark:bg-darkBg">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-300 to-brand-700 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center sm:pt-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="inline-flex items-center space-x-2 rounded-full border border-brand-200 bg-brand-50/50 px-3.5 py-1 text-xs font-semibold text-brand-700 dark:border-brand-900/50 dark:bg-brand-950/20 dark:text-brand-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Exclusively for College Campuses</span>
          </div>
          
          <h1 className="mt-6 font-sans text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Campus Freelancing,<br />
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Servo connects skilled students offering coding, academic tutoring, designing, and career readiness with peers who need guidance. Safe, fee-free, and powered by students.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto mt-10 max-w-lg flex items-center bg-white shadow-lg rounded-xl border border-gray-100 p-1.5 dark:bg-darkCard dark:border-darkBorder">
            <div className="flex flex-1 items-center px-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="What service are you looking for today?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-none bg-transparent py-2 px-3 text-sm text-gray-900 focus:outline-none dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 dark:bg-brand-700 dark:hover:bg-brand-600"
            >
              Search
            </button>
          </form>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-200 bg-white/40 dark:border-darkBorder dark:bg-darkCard/20 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-8 text-center sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">100%</span>
              <span className="text-sm font-medium text-gray-500 mt-1">Peer-to-Peer Model</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">₹0</span>
              <span className="text-sm font-medium text-gray-500 mt-1">Commission Fees</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">AI-Powered</span>
              <span className="text-sm font-medium text-gray-500 mt-1">Resume & Profile Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <h2 className="text-center font-sans text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Explore Campus Categories
        </h2>
        <div className="mx-auto mt-12 grid max-w-lg gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/marketplace?category=${cat.name}`}
                className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md dark:border-darkBorder dark:bg-darkCard hover:-translate-y-1 transition-all"
              >
                <div className="space-y-4">
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${cat.color} p-3 text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {cat.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs font-semibold text-brand-600 mt-6 group-hover:translate-x-1 transition-transform dark:text-brand-400">
                  <span>Explore listings</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Services */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Popular Services Near You
          </h2>
          <Link
            to="/marketplace"
            className="flex items-center text-sm font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            <span>Browse all services</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featured.length === 0 ? (
          <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
            No service listings yet. Be the first to create one!
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* Benefits / Trust */}
      <section className="bg-white dark:bg-darkCard py-16 sm:py-24 border-t border-gray-100 dark:border-darkBorder">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-600 dark:text-brand-400">Trust & Safety</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why use Servo for campus jobs?
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 flex-none text-brand-600 dark:text-brand-400" />
                  Verified College ID
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-gray-600 dark:text-gray-400">
                  Every user registers with their college roll number and email. Rest assured you are trading services with members of your own campus community.
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 flex-none text-brand-600 dark:text-brand-400" />
                  Real-time Messaging
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-gray-600 dark:text-gray-400">
                  Built-in WebSockets chat allows students to share deliverables, align on order terms, see typing indicators, and receive live notifications.
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 flex-none text-brand-600 dark:text-brand-400" />
                  Transparent Reviews
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-gray-600 dark:text-gray-400">
                  Read testimonials and ratings on student profiles before hiring. Once work is delivered and approved, you can leave structured feedback.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-12 lg:px-8 border-t border-gray-100 dark:border-darkBorder">
        <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Servo Marketplace. Final Year CSE Project. Built with FastAPI, React, and Gemini AI.
        </p>
      </footer>
    </div>
  );
};

export default Landing;

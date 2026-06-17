import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Heart, Check, Clock, ChevronRight, Tag } from 'lucide-react';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Neo-Brutalist Illustrations
import heroBoat from '../assets/hero_boat.png';
import marketingAnalysis from '../assets/marketing_analysis.png';
import planningSteps from '../assets/planning_steps.png';
import handshakeReady from '../assets/handshake_ready.png';
import creativeMarketing from '../assets/creative_marketing.png';
import quoteLaptop from '../assets/quote_laptop.png';

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

  return (
    <div className="bg-white text-brutal-charcoal">
      
      {/* SECTION 1: Red Hero Section */}
      <section className="bg-brutal-red text-white py-16 px-6 sm:px-12 border-b-4 border-brutal-charcoal">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl font-serif font-black leading-tight tracking-tight">
              Campus freelancing looks good now.
            </h1>
            <p className="text-lg font-medium opacity-90 max-w-xl">
              Connect with skilled peers right on your campus. Get tutoring, coding assistance, custom graphics, or career reviews. Safe, direct, and zero fees.
            </p>
            
            {/* Search Bar / Input inside Hero */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find design, coding, tutoring..."
                className="w-full px-4 py-3 text-brutal-charcoal font-bold border-2 border-brutal-charcoal rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
              <button
                type="submit"
                className="brutal-btn-yellow px-6 py-3 rounded-none whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <div className="flex gap-4 pt-4">
              <Link to="/marketplace" className="brutal-btn-yellow px-6 py-3 text-sm rounded-none">
                Browse Services
              </Link>
              <Link to="/register" className="brutal-btn-black px-6 py-3 text-sm rounded-none">
                Join Servo
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img 
              src={heroBoat} 
              alt="Man in red boat with telescope" 
              className="w-full max-w-md border-4 border-brutal-charcoal bg-white p-4 shadow-brutal-lg rounded-none"
            />
          </div>
        </div>
        {/* Pagination indicators mock */}
        <div className="flex justify-center space-x-2 mt-12">
          <span className="w-2.5 h-2.5 rounded-full bg-brutal-yellow border border-brutal-charcoal"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-brutal-charcoal"></span>
        </div>
      </section>

      {/* SECTION 2: Three Columns Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b-4 border-brutal-charcoal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="border-2 border-brutal-charcoal p-3 bg-white inline-block shadow-brutal-sm rounded-none">
              <img src={marketingAnalysis} alt="Analyzing requirements" className="h-36 w-auto mx-auto object-contain" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Analyzing your campus requirements</h3>
            <p className="text-sm font-semibold text-gray-600">
              Browse localized service proposals. Students outline precisely what milestones, resources, and help they provide.
            </p>
          </div>
          
          <div className="space-y-4 text-center md:text-left">
            <div className="border-2 border-brutal-charcoal p-3 bg-white inline-block shadow-brutal-sm rounded-none">
              <img src={planningSteps} alt="Planning steps" className="h-36 w-auto mx-auto object-contain" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Planning the steps to rocket your grades</h3>
            <p className="text-sm font-semibold text-gray-600">
              Collaborate directly using real-time chat. Agree on milestones, upload drafts, and keep learning interactive.
            </p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <div className="border-2 border-brutal-charcoal p-3 bg-white inline-block shadow-brutal-sm rounded-none">
              <img src={handshakeReady} alt="Work reported ready" className="h-36 w-auto mx-auto object-contain" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Our work isn't finished until we report it ready</h3>
            <p className="text-sm font-semibold text-gray-600">
              Review deliveries directly on campus. Rest assured that the transaction concludes with direct student confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Yellow We love marketing stuff banner */}
      <section className="bg-brutal-yellow border-b-4 border-brutal-charcoal py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative inline-block">
            {/* Round Avatar of Grandma */}
            <div className="w-20 h-20 rounded-full border-4 border-brutal-charcoal bg-white flex items-center justify-center overflow-hidden mx-auto shadow-brutal-sm">
              <span className="text-3xl">👵</span>
            </div>
            {/* Speech bubble badge */}
            <span className="absolute -top-1 right-2 bg-pink-400 text-white text-[10px] font-black border-2 border-brutal-charcoal px-1.5 py-0.5 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              HI
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
            We love student hustle.<br />We mean it.
          </h2>
          <div>
            <Link to="/about" className="brutal-btn-black text-xs px-6 py-2.5 rounded-none uppercase">
              Learn about Servo
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: Find More / Popular Services Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b-4 border-brutal-charcoal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img 
              src={creativeMarketing} 
              alt="Two women talking illustration" 
              className="w-full max-w-md border-4 border-brutal-charcoal shadow-brutal-md rounded-none bg-white p-4 mx-auto"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-black tracking-tight">Find More</h2>
            <h3 className="text-2xl font-extrabold text-gray-700">Being creative in marketplace</h3>
            <p className="text-base font-semibold text-gray-600">
              Get tasks off your plate or offer your skills. Expand your resume by developing products, styling websites, or setting up databases for campus clients.
            </p>
            <div>
              <Link to="/marketplace" className="brutal-btn-yellow px-6 py-3 text-sm rounded-none">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="border-2 border-brutal-charcoal p-6 bg-white shadow-brutal-md rounded-none flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xl font-black border-b-2 border-brutal-charcoal pb-2">Technical Hub</h4>
              <p className="text-xs font-bold text-gray-600">
                Hire student developers to write React components, debug Python scripts, design clean APIs, or build custom software.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/marketplace?category=Technical" className="brutal-btn-yellow px-4 py-2 text-xs rounded-none">
                Read more
              </Link>
            </div>
          </div>

          <div className="border-2 border-brutal-charcoal p-6 bg-white shadow-brutal-md rounded-none flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xl font-black border-b-2 border-brutal-charcoal pb-2">Academic Guidance</h4>
              <p className="text-xs font-bold text-gray-600">
                Stuck on complex mathematics or lab reports? Book structured peer tutoring or proofreading sessions with senior campus students.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/marketplace?category=Academic" className="brutal-btn-yellow px-4 py-2 text-xs rounded-none">
                Read more
              </Link>
            </div>
          </div>

          <div className="border-2 border-brutal-charcoal p-6 bg-white shadow-brutal-md rounded-none flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xl font-black border-b-2 border-brutal-charcoal pb-2">Design & Branding</h4>
              <p className="text-xs font-bold text-gray-600">
                Build club flyers, custom illustrations, slide deck themes, vector graphics, or complete Figma visual designs.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/marketplace?category=Creative" className="brutal-btn-yellow px-4 py-2 text-xs rounded-none">
                Read more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4B: Featured Services List (Vibrant Brutalist style) */}
      <section className="bg-gray-50 border-b-4 border-brutal-charcoal py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Popular Campus Services</h2>
              <p className="text-sm font-semibold text-gray-600 mt-1">Directly provided by verified students on campus</p>
            </div>
            <div>
              <Link to="/marketplace" className="inline-flex items-center text-sm font-black text-brutal-charcoal hover:underline">
                Explore all listings
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featured.length === 0 ? (
            <div className="border-2 border-dashed border-brutal-charcoal p-12 text-center text-gray-600 font-bold bg-white">
              No services listed on campus yet. Be the first to publish your talent!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: Stats Ribbon Section */}
      <section className="bg-brutal-red py-12 px-6 border-b-4 border-brutal-charcoal">
        <div className="max-w-4xl mx-auto bg-white border-4 border-brutal-charcoal shadow-brutal-lg rounded-none px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-brutal-charcoal/20">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl font-black text-brutal-red flex items-center">
                <Heart className="h-6 w-6 mr-2 fill-brutal-red text-brutal-red" />
                24
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-brutal-charcoal mt-1">Very Matchless</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl font-black text-brutal-charcoal flex items-center">
                <Check className="h-6 w-6 mr-2 text-emerald-500 stroke-[3px]" />
                597
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-brutal-charcoal mt-1">Employed Stuff</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-3xl font-black text-brutal-charcoal flex items-center">
                <Clock className="h-6 w-6 mr-2 text-brutal-charcoal" />
                1776
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-brutal-charcoal mt-1">Making More</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: A, B, C Underlined Columns */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b-4 border-brutal-charcoal text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column A */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-6xl font-black tracking-tighter text-brutal-charcoal block">A</span>
                <span className="inline-block border-b-4 border-brutal-charcoal w-10"></span>
              </div>
              <p className="text-sm font-semibold text-gray-600">
                Explore student listings inside the campus directory. Rest assured that all service providers are college mates with verified IDs.
              </p>
              <p className="text-xs font-bold text-gray-500">
                Connect instantly and ask queries directly through chat logs.
              </p>
            </div>
            <div>
              <Link to="/marketplace" className="brutal-btn-yellow text-xs px-4 py-2 rounded-none inline-block">
                Read more
              </Link>
            </div>
          </div>

          {/* Column B */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-6xl font-black tracking-tighter text-brutal-charcoal block">B</span>
                <span className="inline-block border-b-4 border-brutal-charcoal w-10"></span>
              </div>
              <p className="text-sm font-semibold text-gray-600">
                Set up service scopes, define deadlines, and place secure custom orders. No credit card required. Trading uses direct peer terms.
              </p>
              <p className="text-xs font-bold text-gray-500">
                Keep operations completely transparent with progress updates.
              </p>
            </div>
            <div>
              <Link to="/about" className="brutal-btn-yellow text-xs px-4 py-2 rounded-none inline-block">
                Visit
              </Link>
            </div>
          </div>

          {/* Column C */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-6xl font-black tracking-tighter text-brutal-charcoal block">C</span>
                <span className="inline-block border-b-4 border-brutal-charcoal w-10"></span>
              </div>
              <p className="text-sm font-semibold text-gray-600">
                Approve final submissions and post feedback tags directly onto profile cards. Gain credentials and experience for your resume.
              </p>
              <p className="text-xs font-bold text-gray-500">
                Build campus credentials and testimonials visible to all peers.
              </p>
            </div>
            <div>
              <Link to="/register" className="brutal-btn-yellow text-xs px-4 py-2 rounded-none inline-block">
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Events Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-b-4 border-brutal-charcoal">
        <h2 className="text-4xl font-black tracking-tight text-center mb-16">Events</h2>
        <div className="space-y-8">
          
          {/* Event 1 */}
          <div className="border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-md rounded-none flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-black text-brutal-red uppercase bg-brutal-red/10 border border-brutal-red/30 px-3 py-1 rounded-none whitespace-nowrap">
                27 Jan
              </span>
              <div>
                <h4 className="text-lg font-black">Title of first event</h4>
                <p className="text-xs font-bold text-gray-500">Campus freelancing and networking masterclass.</p>
              </div>
            </div>
            <div>
              <Link to="/register" className="brutal-btn-yellow text-xs px-4 py-2.5 rounded-none whitespace-nowrap inline-block">
                Join now
              </Link>
            </div>
          </div>

          {/* Event 2 */}
          <div className="border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-md rounded-none flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-black text-brutal-charcoal uppercase bg-gray-100 border border-brutal-charcoal px-3 py-1 rounded-none whitespace-nowrap">
                12 Feb
              </span>
              <div>
                <h4 className="text-lg font-black">You should join this marketing</h4>
                <p className="text-xs font-bold text-gray-500">Reviewing top campus resumes and design portfolios.</p>
              </div>
            </div>
            <div>
              <Link to="/about" className="brutal-btn-yellow text-xs px-4 py-2.5 rounded-none whitespace-nowrap inline-block">
                Visit
              </Link>
            </div>
          </div>

          {/* Event 3 */}
          <div className="border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-md rounded-none flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-black text-brutal-charcoal uppercase bg-gray-100 border border-brutal-charcoal px-3 py-1 rounded-none whitespace-nowrap">
                05 Mar
              </span>
              <div>
                <h4 className="text-lg font-black">All other event</h4>
                <p className="text-xs font-bold text-gray-500">Full stack FastAPI and React campus development.</p>
              </div>
            </div>
            <div>
              <Link to="/register" className="brutal-btn-yellow text-xs px-4 py-2.5 rounded-none whitespace-nowrap inline-block">
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Red Call to Action quote now section */}
      <section className="bg-brutal-red text-white py-20 px-6 border-b-4 border-brutal-charcoal text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center">
            <img 
              src={quoteLaptop} 
              alt="Person at laptop quote" 
              className="h-44 w-auto object-contain border-4 border-brutal-charcoal bg-white p-4 shadow-brutal-md rounded-none"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-black tracking-tight">Ask for a quote now!</h2>
            <p className="text-sm font-bold text-white/90 max-w-lg mx-auto">
              This is the last call for big discounts and local peer matches. Get the most out of your campus network today.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/marketplace" className="brutal-btn-yellow text-xs px-6 py-3 rounded-none uppercase">
              Learn More
            </Link>
            <Link to="/register" className="brutal-btn-black text-xs px-6 py-3 rounded-none uppercase">
              Get Quote
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9: Black Footer Section */}
      <footer className="bg-brutal-charcoal text-white py-16 px-6 border-t-2 border-brutal-charcoal">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-4xl font-black tracking-tight text-white">
              Servo
            </h2>
            <p className="text-xs font-bold text-gray-400 max-w-sm mx-auto">
              Peer-to-Peer Freelance Market exclusively designed and secure for your College Campus.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-gray-300 border-t border-b border-white/10 py-6">
            <Link to="/marketplace" className="hover:underline hover:text-white">Templates</Link>
            <Link to="/about" className="hover:underline hover:text-white">Articles</Link>
            <Link to="/about" className="hover:underline hover:text-white">Free tutorials</Link>
            <Link to="/marketplace" className="hover:underline hover:text-white">Subscription</Link>
            <Link to="/about" className="hover:underline hover:text-white">Help</Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-black tracking-wider uppercase text-gray-400 gap-4">
            <p>&copy; {new Date().getFullYear()} Servo Marketplace. Final Year CSE Project.</p>
            <div className="flex space-x-4">
              <span className="hover:text-white cursor-pointer">Facebook</span>
              <span className="hover:text-white cursor-pointer">Twitter</span>
              <span className="hover:text-white cursor-pointer">Instagram</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

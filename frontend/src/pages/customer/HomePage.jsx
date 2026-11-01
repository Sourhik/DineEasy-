import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Star,
  UtensilsCrossed,
  ArrowRight,
  Calendar,
  Sparkles,
  CheckCircle,
  Eye,
} from 'lucide-react';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState(['All']);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
    fetchCuisines();
  }, [selectedCuisine]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/restaurants', { params });
      if (res.data.success) {
        setRestaurants(res.data.restaurants);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuisines = async () => {
    try {
      const res = await api.get('/restaurants/cuisines');
      if (res.data.success) {
        setCuisines(res.data.cuisines);
      }
    } catch (err) {
      console.error('Failed to load cuisines:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  return (
    <div className="min-h-screen bg-theme-page text-charcoal-900">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b theme-canvas-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur border border-cream-200 text-charcoal-900 text-xs font-bold tracking-wide uppercase shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-burgundy-600" />
            Simple & Reliable Table Reservations
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight theme-canvas-title leading-tight">
            Reserve Your Table at Top Restaurants in <span className="text-burgundy-600 italic">Seconds</span>
          </h1>

          <p className="text-base sm:text-lg theme-canvas-sub max-w-2xl mx-auto font-normal leading-relaxed">
            Discover verified restaurants, view real-time table availability, optionally choose your food courses, and get immediate booking confirmation.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mt-6 flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white border border-cream-200 shadow-2xl"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <Search className="w-5 h-5 text-burgundy-600 shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Search Tables</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Cuisine filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  selectedCuisine === c
                    ? 'bg-burgundy-700 text-white ring-2 ring-burgundy-600'
                    : 'bg-white text-charcoal-900 hover:bg-white border border-cream-200 hover:border-burgundy-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 border-b theme-canvas-border pb-5">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight theme-canvas-title">
              Featured Dining Spots
            </h2>
            <p className="text-sm theme-canvas-sub mt-1">
              Select a restaurant to view its full menu or book a dining table directly
            </p>
          </div>
          <Link
            to="/restaurants"
            className="text-burgundy-700 hover:text-burgundy-900 text-sm font-bold flex items-center gap-1.5"
          >
            <span>View All Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-white border border-cream-200 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-cream-200 shadow-sm space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-gold-600 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-charcoal-900">No restaurants found</h3>
            <p className="text-xs text-charcoal-500">Try choosing a different cuisine filter or clear your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Cover Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Rating badge */}
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-white/95 shadow-md flex items-center gap-1 text-xs text-charcoal-900 font-bold">
                    <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                    <span>{r.rating || 4.8}</span>
                  </div>

                  {/* Logo overlay */}
                  <div className="absolute -bottom-4 left-5 w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-white shadow-md">
                    <img src={r.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 pt-7 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-serif text-xl font-bold text-charcoal-900 group-hover:text-burgundy-600 transition-colors">
                        {r.name}
                      </h3>
                      <span className="text-xs font-bold text-burgundy-700 bg-burgundy-50 px-2 py-0.5 rounded-full border border-burgundy-200">
                        {r.priceRange || '$$$'}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal-800 line-clamp-2 leading-relaxed mb-3">
                      {r.description}
                    </p>

                    {/* Cuisine badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3.5">
                      {(r.cuisine || []).map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-0.5 rounded-lg bg-burgundy-50 text-burgundy-800 text-[11px] font-bold border border-burgundy-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* Metadata items */}
                    <div className="space-y-1.5 text-xs text-charcoal-900 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                        <span className="truncate">{r.address}, {r.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                        <span>{r.openingHours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-charcoal-700 shrink-0" />
                        <span>{r.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons: View Restaurant and Book a Table */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cream-200">
                    <Link
                      to={`/restaurant/${r._id}`}
                      className="py-3 px-3 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 text-xs font-bold text-center transition-colors border border-cream-300 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-charcoal-600" />
                      <span>View Restaurant</span>
                    </Link>

                    <Link
                      to={`/book/${r._id}`}
                      className="py-3 px-3 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white text-xs font-bold text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book a Table</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Simple 4-Step Process Explanation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t theme-canvas-border">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold theme-canvas-title">
              How Simple Table Booking Works
            </h2>
            <p className="text-sm theme-canvas-sub">
              Reserve your spot in four straightforward numbered steps:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-cream-200 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-full bg-burgundy-600 text-white flex items-center justify-center mx-auto text-base font-bold shadow-sm">
                1
              </div>
              <h4 className="font-serif text-base font-bold text-charcoal-900">Select Restaurant</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Browse our verified restaurants and select your favorite cuisine and ambiance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-cream-200 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-full bg-burgundy-600 text-white flex items-center justify-center mx-auto text-base font-bold shadow-sm">
                2
              </div>
              <h4 className="font-serif text-base font-bold text-charcoal-900">Choose Date & Time</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Select your preferred dining date, time slot, and guest count with real-time availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-cream-200 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-full bg-burgundy-600 text-white flex items-center justify-center mx-auto text-base font-bold shadow-sm">
                3
              </div>
              <h4 className="font-serif text-base font-bold text-charcoal-900">Optional Menu Choice</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Choose to pre-order food courses from the published menu or decide at the table.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-cream-200 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-full bg-burgundy-600 text-white flex items-center justify-center mx-auto text-base font-bold shadow-sm">
                4
              </div>
              <h4 className="font-serif text-base font-bold text-charcoal-900">Instant Booking ID</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Receive your unique booking ID immediately, with details sent to the restaurant dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

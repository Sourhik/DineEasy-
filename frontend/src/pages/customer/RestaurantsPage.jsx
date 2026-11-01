import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Phone,
  Star,
  Calendar,
  UtensilsCrossed,
  Eye,
} from 'lucide-react';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState(['All']);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCuisines();
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, sortBy]);

  const fetchCuisines = async () => {
    try {
      const res = await api.get('/restaurants/cuisines');
      if (res.data.success) {
        setCuisines(res.data.cuisines);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = { sortBy };
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (search) params.search = search;

      const res = await api.get('/restaurants', { params });
      if (res.data.success) {
        setRestaurants(res.data.restaurants);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  return (
    <div className="min-h-screen bg-theme-page py-12 px-4 sm:px-6 lg:px-8 text-charcoal-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight theme-canvas-title">
            Explore All Restaurants
          </h1>
          <p className="text-sm theme-canvas-sub">
            Browse registered restaurants, check published menus, and reserve tables with real-time confirmation.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-cream-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-burgundy-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by restaurant name, cuisine, street..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-cream-50 border border-cream-300 rounded-xl px-3 py-2.5 text-xs text-charcoal-800 font-semibold focus:outline-none"
              >
                <option value="rating">Sort: Highest Rating</option>
                <option value="name">Sort: Name (A to Z)</option>
                <option value="newest">Sort: Newly Added</option>
              </select>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Cuisines */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-charcoal-800 shrink-0 font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-burgundy-600" /> Cuisines:
            </span>
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedCuisine === c
                    ? 'bg-burgundy-700 text-white shadow-sm ring-2 ring-burgundy-600'
                    : 'bg-cream-100 text-charcoal-900 hover:border-burgundy-600 border border-cream-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-charcoal-500 flex items-center justify-between">
          <span>Found {restaurants.length} restaurant(s)</span>
          {selectedCuisine !== 'All' && (
            <button
              onClick={() => setSelectedCuisine('All')}
              className="text-burgundy-600 hover:underline font-bold"
            >
              Reset cuisine filter
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-white animate-pulse border border-cream-200 shadow-sm" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-cream-200 shadow-sm space-y-2">
            <UtensilsCrossed className="w-12 h-12 text-gold-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-charcoal-900">No restaurants match your search</h3>
            <p className="text-xs text-charcoal-500">Try adjusting your search criteria or resetting filters.</p>
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

                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-white/95 shadow-md flex items-center gap-1 text-xs text-charcoal-900 font-bold">
                    <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                    <span>{r.rating || 4.8}</span>
                  </div>

                  <div className="absolute -bottom-4 left-5 w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-white shadow-md">
                    <img src={r.logo} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Details */}
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
      </div>
    </div>
  );
};

export default RestaurantsPage;

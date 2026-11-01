import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Calendar,
  UtensilsCrossed,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restRes, menuRes] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get(`/restaurants/${id}/menu`),
      ]);

      if (restRes.data.success) {
        setRestaurant(restRes.data.restaurant);
      }
      if (menuRes.data.success) {
        setMenuItems(menuRes.data.menuItems);
      }
    } catch (err) {
      console.error('Failed to load restaurant details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center text-charcoal-800">
        <div className="text-center space-y-3">
          <UtensilsCrossed className="w-10 h-10 animate-spin mx-auto text-gold-600" />
          <p className="font-serif text-lg font-bold text-charcoal-900">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-cream-100 py-20 text-center text-charcoal-900">
        <h2 className="text-2xl font-serif font-bold">Restaurant not found</h2>
        <Link to="/restaurants" className="mt-4 inline-block text-burgundy-600 underline font-bold">
          Back to all restaurants
        </Link>
      </div>
    );
  }

  const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Drinks', 'Chef Specials'];

  const displayedDishes =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-theme-page text-charcoal-900 pb-20">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-600 hover:text-burgundy-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-cream-300 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Restaurants</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 border border-cream-300 shadow-md">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Details Bar inside Banner */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white bg-white shadow-xl shrink-0">
                <img src={restaurant.logo} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 text-white">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-4xl font-bold">
                    {restaurant.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-charcoal-900 font-bold text-xs">
                    ★ {restaurant.rating || 4.8}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {(restaurant.cuisine || []).map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                  <span className="text-xs text-cream-200">
                    Price: {restaurant.priceRange || '$$$'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/book/${restaurant._id}`}
              className="px-7 py-3.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-sm transition-all shadow-lg flex items-center gap-2 shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Table Now</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-cream-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy-50 border border-burgundy-200 flex items-center justify-center text-burgundy-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Address & Location</div>
              <div className="text-sm font-semibold text-charcoal-900 mt-0.5">{restaurant.address}, {restaurant.city}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Opening Hours</div>
              <div className="text-sm font-semibold text-charcoal-900 mt-0.5">{restaurant.openingHours}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-center justify-center text-charcoal-700 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Direct Contact</div>
              <div className="text-sm font-semibold text-charcoal-900 mt-0.5">
                {restaurant.phone} • {restaurant.totalTables || 12} Tables Available
              </div>
            </div>
          </div>
        </div>

        {/* About Restaurant Snippet */}
        {restaurant.description && (
          <div className="mt-6 bg-white border border-cream-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">About The Restaurant</h3>
            <p className="text-sm text-charcoal-600 leading-relaxed font-normal">
              {restaurant.description}
            </p>
          </div>
        )}
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-cream-300 pb-5">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              Published Food Menu
            </h2>
            <p className="text-xs text-charcoal-600 mt-0.5">
              Live menu synchronized with {restaurant.name}'s kitchen. Available to pre-order when booking your table.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'bg-white text-charcoal-700 border border-cream-300 hover:border-gold-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {displayedDishes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-cream-200 shadow-sm space-y-2">
            <UtensilsCrossed className="w-10 h-10 text-gold-600 mx-auto" />
            <p className="text-sm font-semibold text-charcoal-700">No dishes currently listed under this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDishes.map((dish) => (
              <div
                key={dish._id}
                className="rounded-3xl bg-white border border-cream-300 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        dish.dietary === 'veg'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {dish.dietary}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-white/95 shadow-sm text-[10px] font-bold text-charcoal-800">
                    {dish.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-base font-bold text-charcoal-900">{dish.name}</h4>
                      <span className="text-base font-bold text-gold-600">${dish.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-charcoal-600 line-clamp-2 mt-1 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> In Kitchen Stock
                    </span>
                    <Link
                      to={`/book/${restaurant._id}`}
                      className="text-burgundy-600 hover:text-burgundy-700 font-bold"
                    >
                      Pre-order in Booking →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="mt-16 rounded-3xl bg-white border border-cream-300 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <Calendar className="w-10 h-10 text-burgundy-600 mx-auto" />
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Reserve Your Table at {restaurant.name}
          </h3>
          <p className="text-sm text-charcoal-600 max-w-xl mx-auto">
            Book now in less than two minutes. Table availability is updated in real time.
          </p>
          <div className="pt-2">
            <Link
              to={`/book/${restaurant._id}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Proceed to Booking Table</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;

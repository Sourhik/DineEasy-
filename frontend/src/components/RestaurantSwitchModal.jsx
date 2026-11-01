import React, { useState } from 'react';
import { useActiveRestaurant } from '../context/RestaurantContext';
import {
  ArrowLeftRight,
  Search,
  X,
  CheckCircle,
  MapPin,
  Store,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';

const RestaurantSwitchModal = () => {
  const {
    activeRestaurant,
    availableRestaurants,
    loading,
    switching,
    switchSuccessMessage,
    switchError,
    isSwitchModalOpen,
    closeSwitchModal,
    switchRestaurant,
  } = useActiveRestaurant();

  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

  if (!isSwitchModalOpen) return null;

  const filteredRestaurants = availableRestaurants.filter((r) => {
    const term = search.toLowerCase();
    const nameMatch = r.name?.toLowerCase().includes(term);
    const codeMatch = r.restaurantCode?.toLowerCase().includes(term);
    const addrMatch = r.address?.toLowerCase().includes(term);
    return nameMatch || codeMatch || addrMatch;
  });

  const handleSelectToSwitch = (restaurant) => {
    if (activeRestaurant && activeRestaurant._id === restaurant._id) {
      return; // already active
    }
    // Show confirmation step as requested
    setConfirmTarget(restaurant);
  };

  const handleConfirmSwitch = async () => {
    if (!confirmTarget) return;
    const result = await switchRestaurant(confirmTarget._id);
    if (result && result.success) {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-900/70 backdrop-blur-sm flex items-center justify-center p-4 text-charcoal-900">
      <div className="bg-white border border-cream-300 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-burgundy-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                Switch Restaurant
              </h3>
              <p className="text-xs text-charcoal-600">
                Authorized establishments under your account management.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmTarget(null);
              closeSwitchModal();
            }}
            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {switchSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{switchSuccessMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {switchError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{switchError}</span>
          </div>
        )}

        {/* Confirmation Dialog Step */}
        {confirmTarget ? (
          <div className="p-5 rounded-2xl bg-cream-50 border-2 border-gold-400 space-y-4 shadow-sm animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <img
                src={
                  confirmTarget.image ||
                  confirmTarget.logo ||
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'
                }
                alt={confirmTarget.name}
                className="w-14 h-14 rounded-2xl object-cover border border-cream-300 shrink-0 shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-burgundy-700 bg-burgundy-50 px-2 py-0.5 rounded border border-burgundy-200">
                  Confirmation Required
                </span>
                <h4 className="font-serif text-lg font-bold text-charcoal-900 mt-1">
                  Switch to {confirmTarget.name}?
                </h4>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  Your dashboard will refresh to manage reservations, menus, and orders for{' '}
                  <strong className="text-charcoal-900">{confirmTarget.name}</strong> (
                  <span className="font-mono text-burgundy-700">{confirmTarget.restaurantCode}</span>
                  ).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 rounded-xl bg-white border border-cream-300 text-charcoal-700 font-bold text-xs hover:bg-cream-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={switching}
                onClick={handleConfirmSwitch}
                className="px-5 py-2 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                {switching ? 'Switching...' : 'Yes, Confirm & Switch'}
              </button>
            </div>
          </div>
        ) : null}

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by restaurant name, ID (e.g. REST001), address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cream-50 border border-cream-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Selectable Restaurant Cards List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-charcoal-600 font-bold">
              Loading authorized restaurants...
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="py-8 text-center text-xs text-charcoal-500 bg-cream-50 rounded-2xl border border-cream-200">
              No matching restaurants found in your authorized portfolio.
            </div>
          ) : (
            filteredRestaurants.map((rest) => {
              const isCurrent =
                activeRestaurant &&
                (activeRestaurant._id === rest._id ||
                  activeRestaurant.restaurantCode === rest.restaurantCode);

              return (
                <div
                  key={rest._id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-gold-50/50 border-gold-400 ring-1 ring-gold-400 shadow-sm'
                      : 'bg-white border-cream-300 hover:border-charcoal-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        rest.logo ||
                        rest.image ||
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={rest.name}
                      className="w-12 h-12 rounded-xl object-cover border border-cream-300 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-charcoal-900 truncate">
                          {rest.name}
                        </h4>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cream-100 text-charcoal-700 border border-cream-300 shrink-0">
                          {rest.restaurantCode || `REST${rest._id.slice(-4).toUpperCase()}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-charcoal-600 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-burgundy-700 shrink-0" />
                        <span className="truncate">{rest.address}, {rest.city}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            rest.status === 'active' || rest.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rest.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                        {rest.cuisine && (
                          <span className="text-[10px] text-charcoal-500">
                            • {Array.isArray(rest.cuisine) ? rest.cuisine.join(', ') : rest.cuisine}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-cream-200">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500 text-charcoal-900 font-bold text-xs shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectToSwitch(rest)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-burgundy-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-gold-400" />
                        <span>Switch</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div className="pt-2 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role-Based Restaurant Access Verified</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setConfirmTarget(null);
              closeSwitchModal();
            }}
            className="px-4 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSwitchModal;


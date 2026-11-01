import React, { useState } from 'react';
import { useActiveRestaurant } from '../../context/RestaurantContext';
import { Settings, BellRing, Clock, AlertTriangle, Check, Shield, ArrowLeftRight } from 'lucide-react';

const RestaurantSettings = () => {
  const { activeRestaurant, openSwitchModal } = useActiveRestaurant();
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [instantBooking, setInstantBooking] = useState(false);
  const [minNoticeHours, setMinNoticeHours] = useState(2);
  const [pauseBookings, setPauseBookings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setNotice('Operational preferences saved successfully.');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-charcoal-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
              Preferences
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-charcoal-900 text-gold-400">
              {activeRestaurant?.restaurantCode || 'REST001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Settings — {activeRestaurant?.name || 'Restaurant Settings'}
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Configure notification alerts, booking confirmation policies, and operational controls.
          </p>
        </div>

        <button
          type="button"
          onClick={openSwitchModal}
          className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
        >
          <ArrowLeftRight className="w-4 h-4 text-charcoal-900" />
          <span>Switch Restaurant</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between font-bold">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            {notice}
          </span>
          <button onClick={() => setNotice('')} className="text-charcoal-500 font-bold">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal-900 border-b border-cream-200 pb-2">
            Reservation Rules
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-50 border border-cream-200">
            <div>
              <h4 className="font-bold text-sm text-charcoal-900">Audio & Toast Sound Alerts</h4>
              <p className="text-xs text-charcoal-600">Play an alert sound when a new customer reservation is received.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-50 border border-cream-200">
            <div>
              <h4 className="font-bold text-sm text-charcoal-900">Instant Table Confirmation</h4>
              <p className="text-xs text-charcoal-600">Automatically confirm reservations when table capacity is verified.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={instantBooking}
                onChange={(e) => setInstantBooking(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy-600"></div>
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5 text-xs">
            <label className="font-bold text-charcoal-900">Minimum Advance Notice (Hours)</label>
            <input
              type="number"
              min="0"
              max="48"
              value={minNoticeHours}
              onChange={(e) => setMinNoticeHours(parseInt(e.target.value, 10))}
              className="w-full bg-white border border-cream-300 rounded-xl px-3.5 py-2 text-charcoal-900 font-semibold"
            />
            <span className="text-[11px] text-charcoal-500">Customers must book at least this many hours in advance.</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-200">
            <div>
              <h4 className="font-bold text-sm text-red-900">Temporary Dining Closure</h4>
              <p className="text-xs text-red-700">Temporarily stop accepting new bookings (e.g., kitchen maintenance, private event).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pauseBookings}
                onChange={(e) => setPauseBookings(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-md transition-all"
        >
          {saving ? 'Saving...' : 'Save Operational Settings'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantSettings;


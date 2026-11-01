import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useActiveRestaurant } from '../../context/RestaurantContext';
import { Grid, Plus, CheckCircle, AlertCircle, X, ArrowLeftRight } from 'lucide-react';

const RestaurantTables = () => {
  const { activeRestaurant, refreshTrigger, openSwitchModal } = useActiveRestaurant();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [location, setLocation] = useState('indoor');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurant/tables');
      if (res.data.success) {
        setTables(res.data.tables);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [refreshTrigger, activeRestaurant?._id]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/restaurant/tables', { tableNumber, capacity, location });
      if (res.data.success) {
        setMessage('Table added successfully!');
        setIsModalOpen(false);
        setTableNumber('');
        fetchTables();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding table');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-charcoal-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
              Floor Plan & Capacity
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-charcoal-900 text-gold-400">
              {activeRestaurant?.restaurantCode || 'REST001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Tables — {activeRestaurant?.name || 'Dining Tables'}
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Manage table capacities and dining zones (Indoor, Terrace, Private Dining) for this venue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openSwitchModal}
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-charcoal-900" />
            <span>Switch Restaurant</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-cream-400">✕</button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gold-400">Loading tables...</div>
      ) : tables.length === 0 ? (
        <div className="p-12 text-center bg-dark-900 rounded-3xl border border-dark-800 text-cream-400 text-xs">
          No tables configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((t) => (
            <div
              key={t._id}
              className="p-5 rounded-2xl bg-dark-900 border border-dark-800 hover:border-gold-500/40 transition-all text-center space-y-2 shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-dark-800 border border-gold-500/30 text-gold-400 flex items-center justify-center font-serif font-bold text-sm mx-auto">
                {t.tableNumber}
              </div>
              <div>
                <div className="font-serif font-bold text-cream-100 text-base">Table #{t.tableNumber}</div>
                <div className="text-xs text-cream-300 font-semibold">{t.capacity} Guests</div>
              </div>
              <div className="pt-2 border-t border-dark-800 flex items-center justify-between text-[10px] uppercase font-bold text-cream-400">
                <span>{t.location}</span>
                <span className="text-emerald-400">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-gold-500/40 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-cream-100">Add Dining Table</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-cream-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-cream-300">Table Number / Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-9 or VIP-1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-cream-300">Seating Capacity (Guests) *</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-cream-300">Dining Zone</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="indoor">Indoor Main Dining</option>
                  <option value="outdoor">Outdoor Garden</option>
                  <option value="terrace">Rooftop Terrace</option>
                  <option value="private_dining">Private Dining Room</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-dark-800 text-cream-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-gold-500 text-dark-900 font-bold hover:bg-gold-400"
                >
                  {saving ? 'Adding...' : 'Save Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTables;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('reservation_status_changed', (data) => {
        setActionMessage(`Booking ${data.reservation?.bookingId} updated to ${data.reservation?.status}`);
        fetchReservations();
      });
    }
  }, [socket]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservations/my');
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      setCancellingId(id);
      const res = await api.put(`/reservations/${id}/cancel`);
      if (res.data.success) {
        setActionMessage('Reservation cancelled successfully.');
        fetchReservations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = reservations.filter((r) => {
    if (filterTab === 'upcoming') {
      return r.date >= todayStr && r.status !== 'cancelled' && r.status !== 'rejected';
    }
    if (filterTab === 'past') {
      return r.date < todayStr || r.status === 'completed';
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Confirmation
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-300 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {status === 'rejected' ? 'Declined' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cream-200 text-charcoal-700">
            {status}
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-theme-page py-24 text-center px-4 text-charcoal-900">
        <h2 className="font-serif text-3xl font-bold theme-canvas-title">Please sign in to view your bookings</h2>
        <p className="text-xs theme-canvas-sub mt-2">Check the status of your dining reservations and pre-ordered menus.</p>
        <Link
          to="/login"
          className="mt-6 inline-block px-7 py-3 rounded-xl bg-burgundy-600 text-white font-bold text-xs shadow-md"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-page py-12 px-4 sm:px-6 lg:px-8 text-charcoal-900">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold theme-canvas-title">
              My Reservations
            </h1>
            <p className="text-xs theme-canvas-sub mt-1">
              Track live confirmation status, table details, and food pre-order summaries.
            </p>
          </div>

          <Link
            to="/restaurants"
            className="px-5 py-2.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs transition-all shadow-sm"
          >
            + Book Another Table
          </Link>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between font-medium">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="text-charcoal-500 font-bold">✕</button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-cream-300 pb-2">
          {['upcoming', 'all', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                filterTab === tab
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'bg-white text-charcoal-700 hover:bg-cream-200 border border-cream-300'
              }`}
            >
              {tab} Bookings
            </button>
          ))}
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-white animate-pulse border border-cream-200 shadow-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-cream-200 shadow-sm space-y-4">
            <Calendar className="w-12 h-12 text-gold-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-charcoal-900">No {filterTab} bookings found</h3>
            <p className="text-xs text-charcoal-500">Ready to book an enjoyable dinner?</p>
            <Link
              to="/restaurants"
              className="inline-block px-6 py-2.5 rounded-xl bg-burgundy-600 text-white font-bold text-xs shadow-md"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((res) => {
              const rest = res.restaurantId || {};
              const canCancel = res.status !== 'cancelled' && res.status !== 'rejected' && res.status !== 'completed';

              return (
                <div
                  key={res._id}
                  className="rounded-3xl bg-white border border-cream-300 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5"
                >
                  {/* Top Bar: Booking ID & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 flex items-center justify-center font-serif font-bold text-sm">
                        DE
                      </div>
                      <div>
                        <div className="text-[10px] text-charcoal-500 uppercase font-bold">Booking ID</div>
                        <div className="font-mono text-base font-bold text-burgundy-600">{res.bookingId}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(res.status)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Restaurant Info */}
                    <div className="flex gap-3.5">
                      <img
                        src={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80'}
                        alt=""
                        className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-cream-200"
                      />
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-serif font-bold text-base text-charcoal-900 truncate">
                          {rest.name || res.restaurantName || 'Restaurant'}
                        </h4>
                        <div className="text-xs text-charcoal-600 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-burgundy-600 shrink-0" />
                          <span className="truncate">{rest.address || 'Address'}</span>
                        </div>
                        <div className="text-xs text-charcoal-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          <span>{rest.phone || 'Phone'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-1.5 text-xs bg-cream-50 p-4 rounded-2xl border border-cream-300">
                      <div className="flex items-center justify-between text-charcoal-700">
                        <span className="text-charcoal-500 font-semibold">Date:</span>
                        <strong className="text-charcoal-900">{res.date}</strong>
                      </div>
                      <div className="flex items-center justify-between text-charcoal-700">
                        <span className="text-charcoal-500 font-semibold">Time:</span>
                        <strong className="text-burgundy-600 font-bold">{res.timeSlot}</strong>
                      </div>
                      <div className="flex items-center justify-between text-charcoal-700">
                        <span className="text-charcoal-500 font-semibold">Guests:</span>
                        <strong className="text-charcoal-900">{res.guestsCount} Guest(s)</strong>
                      </div>
                      <div className="flex items-center justify-between text-charcoal-700">
                        <span className="text-charcoal-500 font-semibold">Table:</span>
                        <strong className="text-charcoal-800">{res.tableNumber || 'Assigned on arrival'}</strong>
                      </div>
                    </div>

                    {/* Pre-ordered Food / Actions */}
                    <div className="flex flex-col justify-between space-y-3">
                      <div className="text-xs bg-cream-50 p-4 rounded-2xl border border-cream-300 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-charcoal-900">
                          <span>Menu Pre-Order</span>
                          <span className="text-burgundy-600">{res.menuPreference === 'YES' ? 'YES' : 'NO'}</span>
                        </div>
                        {res.menuPreference === 'YES' && res.selectedItems?.length > 0 ? (
                          <div className="space-y-1 pt-1">
                            {res.selectedItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-charcoal-700">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-mono font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="pt-1.5 border-t border-cream-300 flex justify-between font-bold text-xs text-charcoal-900">
                              <span>Food Est. Total:</span>
                              <span className="text-burgundy-600">${res.estimatedFoodTotal?.toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-charcoal-500">Will order at table.</p>
                        )}
                      </div>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancel(res._id)}
                          disabled={cancellingId === res._id}
                          className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {cancellingId === res._id ? 'Cancelling...' : 'Cancel Reservation'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;

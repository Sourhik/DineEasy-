import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Phone,
  Mail,
  Store,
  DollarSign,
  AlertCircle,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

const AdminReservations = () => {
  const { socket } = useSocket();
  const [reservations, setReservations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (restaurantFilter !== 'all') params.restaurantId = restaurantFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/reservations', { params });
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/admin/restaurants');
      if (res.data.success) {
        setRestaurants(res.data.restaurants);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, restaurantFilter]);

  useEffect(() => {
    if (socket) {
      socket.on('new_reservation', () => fetchReservations());
      socket.on('reservation_updated', () => fetchReservations());
    }
  }, [socket]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/reservations/${id}`, { status });
      if (res.data.success) {
        setNotice(`Reservation #${id.slice(-6).toUpperCase()} status changed to "${status}".`);
        fetchReservations();
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking({ ...selectedBooking, status });
        }
      }
    } catch (err) {
      alert('Failed to update reservation');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300">
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-charcoal-100 text-charcoal-700 border border-charcoal-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-cream-100 text-charcoal-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
            Global Ledger
          </span>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Manage Reservations
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Full audit log of table reservations and pre-ordered dishes across all registered dining partner venues.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-cream-300 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full lg:w-80 relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by booking ID, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Restaurant Selector */}
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500 font-semibold"
          >
            <option value="all">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto">
            {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all text-xs ${
                  statusFilter === st
                    ? 'bg-charcoal-900 text-white font-bold shadow-sm'
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-600 font-bold">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-300 text-charcoal-500 text-xs shadow-sm">
          No table reservations match your active filter.
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-cream-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-charcoal-700 text-[11px] uppercase tracking-wider border-b border-cream-300 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Schedule & Guests</th>
                  <th className="py-3.5 px-4">Menu Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-cream-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-burgundy-700 text-xs">
                      {res.bookingId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal-900">{res.restaurantId?.name || 'Restaurant'}</div>
                      <div className="text-[11px] text-charcoal-500">{res.restaurantId?.address}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">{res.customerName}</div>
                      <div className="text-[11px] text-charcoal-600">{res.customerPhone}</div>
                      <div className="text-[11px] text-charcoal-500">{res.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal-900">{res.date}</div>
                      <div className="text-[11px] text-charcoal-600 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gold-600" />
                        <span>{res.timeSlot} • {res.guestsCount} Guests</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {res.menuPreference === 'YES' && res.selectedDishes?.length > 0 ? (
                        <div>
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                            {res.selectedDishes.length} items (${res.estimatedFoodTotal?.toFixed(2)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-charcoal-500 italic">Order at venue</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(res.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(res)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-cream-100 text-charcoal-800 border border-cream-300 font-semibold flex items-center gap-1 shadow-sm text-xs"
                          title="View Complete Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-gold-600" />
                          <span>Details</span>
                        </button>
                        {res.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(res._id, 'confirmed')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                              title="Confirm Reservation"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(res._id, 'rejected')}
                              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
                              title="Reject Reservation"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(res.status === 'confirmed' || res.status === 'accepted') && (
                          <button
                            onClick={() => handleUpdateStatus(res._id, 'cancelled')}
                            className="px-2.5 py-1.5 rounded-xl bg-charcoal-100 hover:bg-red-50 hover:text-red-700 text-charcoal-700 border border-cream-300 font-semibold text-xs"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cream-300 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-burgundy-600">
                  Reservation Record
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                  {selectedBooking.bookingId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Restaurant & Customer summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-1.5">
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Restaurant Details</span>
                <div className="font-bold text-charcoal-900 text-sm">{selectedBooking.restaurantId?.name}</div>
                <div className="text-xs text-charcoal-600">{selectedBooking.restaurantId?.address}</div>
                <div className="text-xs text-charcoal-600">{selectedBooking.restaurantId?.phone}</div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-1.5">
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Customer Contact</span>
                <div className="font-bold text-charcoal-900 text-sm">{selectedBooking.customerName}</div>
                <div className="text-xs text-charcoal-600">{selectedBooking.customerPhone}</div>
                <div className="text-xs text-charcoal-600">{selectedBooking.customerEmail}</div>
              </div>
            </div>

            {/* Reservation Schedule Details */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-cream-50 border border-cream-300 text-center">
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Date</span>
                <div className="font-bold text-charcoal-900 text-xs mt-0.5">{selectedBooking.date}</div>
              </div>
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Time Slot</span>
                <div className="font-bold text-charcoal-900 text-xs mt-0.5">{selectedBooking.timeSlot}</div>
              </div>
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Guests</span>
                <div className="font-bold text-burgundy-700 text-xs mt-0.5">{selectedBooking.guestsCount} Persons</div>
              </div>
            </div>

            {/* Pre-ordered Food Menu items (if YES) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-charcoal-900">
                  Pre-ordered Menu Items
                </h4>
                <span className="text-xs font-semibold text-charcoal-600">
                  Preference: <strong className="text-charcoal-900">{selectedBooking.menuPreference}</strong>
                </span>
              </div>

              {selectedBooking.menuPreference === 'YES' && selectedBooking.selectedDishes?.length > 0 ? (
                <div className="rounded-2xl border border-cream-300 overflow-hidden bg-cream-50">
                  <div className="p-3 divide-y divide-cream-200 space-y-2">
                    {selectedBooking.selectedDishes.map((dish, i) => (
                      <div key={i} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gold-200 text-gold-900 font-bold flex items-center justify-center text-[10px]">
                            {dish.quantity}x
                          </span>
                          <span className="font-bold text-charcoal-900">{dish.name}</span>
                        </div>
                        <span className="font-serif font-bold text-charcoal-900">
                          ${(dish.price * dish.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-cream-100 border-t border-cream-300 flex justify-between items-center text-xs font-bold text-charcoal-900">
                    <span>Estimated Total</span>
                    <span className="font-serif text-base text-burgundy-700 font-bold">
                      ${selectedBooking.estimatedFoodTotal?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-center text-xs text-charcoal-500 italic">
                  Customer opted to choose food upon arrival at the restaurant.
                </div>
              )}
            </div>

            {/* Status Management Actions */}
            <div className="pt-3 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-charcoal-700">Set Status:</span>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking._id, 'confirmed')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm"
                >
                  Accept / Confirm
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking._id, 'rejected')}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking._id, 'cancelled')}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-100 text-charcoal-800 border border-cream-300 font-bold text-xs hover:bg-cream-200"
                >
                  Cancel
                </button>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useActiveRestaurant } from '../../context/RestaurantContext';
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
  Users,
  ArrowLeftRight,
  MapPin,
} from 'lucide-react';

const RestaurantReservations = () => {
  const { socket } = useSocket();
  const { activeRestaurant, refreshTrigger, openSwitchModal } = useActiveRestaurant();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/restaurant/reservations', { params });
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, refreshTrigger, activeRestaurant?._id]);

  useEffect(() => {
    if (socket) {
      socket.on('new_reservation', (data) => {
        setActionNotice(`New booking ${data.reservation?.bookingId} arrived!`);
        fetchReservations();
      });
      socket.on('reservation_updated', () => {
        fetchReservations();
      });
    }
  }, [socket]);

  const handleUpdateStatus = async (id, status, tableNumber) => {
    try {
      setUpdatingId(id);
      const payload = { status };
      if (tableNumber) payload.tableNumber = tableNumber;

      const res = await api.put(`/restaurant/reservations/${id}/status`, payload);
      if (res.data.success) {
        setActionNotice(`Reservation updated to ${status}. Customer notified.`);
        fetchReservations();
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking(res.data.reservation);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating reservation');
    } finally {
      setUpdatingId(null);
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
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-700" /> Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-gray-600" /> Cancelled
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-charcoal-900">
      {/* Header with Active Restaurant Badge & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
              Reservation Ledger
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-charcoal-900 text-gold-400">
              {activeRestaurant?.restaurantCode || 'REST001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Reservations — {activeRestaurant?.name || 'My Reservations'}
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Accept or reject customer table reservations, assign tables, and review pre-ordered dishes for this venue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openSwitchModal}
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-charcoal-900" />
            <span>Switch Restaurant</span>
          </button>
          <button
            onClick={fetchReservations}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-cream-200 text-charcoal-800 text-xs font-bold border border-cream-300 shadow-sm transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between font-bold">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-charcoal-500 font-bold">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-cream-300 rounded-3xl p-5 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-gold-600 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by Booking ID, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st === 'confirmed' ? 'accepted' : st)}
              className={`px-3.5 py-2 rounded-xl capitalize font-bold transition-all whitespace-nowrap ${
                (statusFilter === st || (st === 'confirmed' && statusFilter === 'accepted'))
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-700 font-bold">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-300 shadow-sm space-y-2">
          <Calendar className="w-12 h-12 text-gold-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-charcoal-900">No reservations found</h3>
          <p className="text-xs text-charcoal-500">No records match your selected filter.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-cream-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-charcoal-600 text-[10px] uppercase tracking-wider border-b border-cream-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Booking ID</th>
                  <th className="py-3.5 px-4 font-bold">Customer Name & Phone</th>
                  <th className="py-3.5 px-4 font-bold">Date & Time</th>
                  <th className="py-3.5 px-4 font-bold">Guests</th>
                  <th className="py-3.5 px-4 font-bold">Food Pre-Order</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-burgundy-600 text-sm">
                      {r.bookingId}
                      <div className="text-[10px] text-charcoal-400 font-sans font-normal">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-charcoal-900 text-sm">{r.customerName}</div>
                      <div className="text-xs text-charcoal-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gold-600" />
                        <span>{r.customerPhone}</span>
                      </div>
                      <div className="text-[11px] text-charcoal-400">{r.customerEmail}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-charcoal-800">{r.date}</div>
                      <div className="text-xs font-bold text-burgundy-600">{r.timeSlot}</div>
                    </td>

                    <td className="py-4 px-4 font-bold text-charcoal-900 text-sm">
                      {r.guestsCount} Guests
                    </td>

                    <td className="py-4 px-4">
                      {r.menuPreference === 'YES' && r.selectedItems?.length > 0 ? (
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 font-bold text-[10px] border border-gold-300">
                            YES (${r.estimatedFoodTotal?.toFixed(2)})
                          </span>
                          <div className="text-[11px] text-charcoal-600 mt-1 line-clamp-1">
                            {r.selectedItems.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-charcoal-500 text-[11px]">No pre-order (Order at table)</span>
                      )}
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(r.status)}</td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(r)}
                          className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-700 border border-cream-300 shadow-sm"
                          title="View Full Booking Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(r._id, 'accepted')}
                              disabled={updatingId === r._id}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(r._id, 'rejected')}
                              disabled={updatingId === r._id}
                              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                            >
                              Reject
                            </button>
                          </>
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-cream-300 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-charcoal-400">Reservation Details</span>
                <h3 className="font-mono text-2xl font-bold text-burgundy-600">{selectedBooking.bookingId}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-charcoal-400 hover:text-charcoal-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-cream-50 p-4 rounded-2xl border border-cream-300">
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Customer Name</span>
                <strong className="text-charcoal-900 text-sm">{selectedBooking.customerName}</strong>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedBooking.status)}</div>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Booking Schedule</span>
                <span className="text-charcoal-800 font-semibold">{selectedBooking.date} at {selectedBooking.timeSlot}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Party Size</span>
                <span className="text-charcoal-800 font-semibold">{selectedBooking.guestsCount} Guests</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Phone</span>
                <span className="text-charcoal-800 font-semibold">{selectedBooking.customerPhone}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Email</span>
                <span className="text-charcoal-800 font-semibold">{selectedBooking.customerEmail}</span>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-300 text-xs text-charcoal-700">
                <span className="font-bold text-charcoal-900">Special Requests: </span>
                {selectedBooking.specialRequests}
              </div>
            )}

            {/* Food Pre-Order info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-charcoal-900 border-b border-cream-200 pb-2">
                <span>Food Pre-Order (Kitchen Ticket)</span>
                <span className="text-burgundy-600">
                  {selectedBooking.menuPreference === 'YES' ? `Total: $${selectedBooking.estimatedFoodTotal?.toFixed(2)}` : 'None'}
                </span>
              </div>

              {selectedBooking.menuPreference === 'YES' && selectedBooking.selectedItems?.length > 0 ? (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedBooking.selectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-cream-50 p-2.5 rounded-xl border border-cream-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-burgundy-600">{item.quantity}x</span>
                        <span className="text-charcoal-900 font-semibold">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-charcoal-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-500">Customer will order food upon seating at the restaurant table.</p>
              )}
            </div>

            {/* Action buttons inside modal */}
            <div className="pt-4 border-t border-cream-200 flex gap-2">
              <button
                onClick={() => handleUpdateStatus(selectedBooking._id, 'accepted')}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                Accept Booking
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedBooking._id, 'rejected')}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantReservations;

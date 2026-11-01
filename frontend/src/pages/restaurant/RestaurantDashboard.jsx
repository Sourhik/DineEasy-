import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useActiveRestaurant } from '../../context/RestaurantContext';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  UtensilsCrossed,
  AlertTriangle,
  ArrowRight,
  Phone,
  ArrowLeftRight,
  MapPin,
  Building,
  Store,
  Sparkles,
} from 'lucide-react';

const RestaurantDashboard = () => {
  const { socket } = useSocket();
  const { activeRestaurant, refreshTrigger, openSwitchModal } = useActiveRestaurant();

  const [stats, setStats] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurant/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRestaurant(res.data.restaurant);
        setRecentReservations(res.data.recentReservations || []);
      }
    } catch (err) {
      console.error('Failed to load restaurant stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger, activeRestaurant?._id]);

  useEffect(() => {
    if (socket) {
      socket.on('new_reservation', () => {
        setActionNotice('New table reservation received!');
        fetchStats();
      });
      socket.on('reservation_updated', () => {
        fetchStats();
      });
    }
  }, [socket]);

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await api.put(`/restaurant/reservations/${id}/status`, { status });
      if (res.data.success) {
        setActionNotice(`Booking updated to ${status}. Customer notified.`);
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reservation');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-charcoal-800">
        <UtensilsCrossed className="w-8 h-8 animate-spin mx-auto mb-2 text-burgundy-600" />
        <p className="text-sm font-bold">Loading dashboard overview...</p>
      </div>
    );
  }

  const currentRest = restaurant || activeRestaurant;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-charcoal-900">
      {/* Top Banner with Active Restaurant Indicator & Switch Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-300 pb-5">
        <div className="flex items-start gap-4">
          <img
            src={
              currentRest?.logo ||
              currentRest?.image ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'
            }
            alt={currentRest?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-cream-300 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
                Active Restaurant
              </span>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-charcoal-900 text-gold-400">
                {currentRest?.restaurantCode || 'REST001'}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  currentRest?.status === 'active' || currentRest?.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {currentRest?.status || 'Active'}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-1">
              {currentRest?.name}
            </h1>
            <p className="text-xs theme-canvas-sub flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>{currentRest?.address}, {currentRest?.city || 'Metropolis'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={openSwitchModal}
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-charcoal-900" />
            <span>Switch Restaurant</span>
          </button>
          <Link
            to="/restaurant-portal/menu"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-cream-200 text-charcoal-800 text-xs font-bold border border-cream-300 shadow-sm transition-all"
          >
            Manage Menu
          </Link>
          <Link
            to="/restaurant-portal/reservations"
            className="px-5 py-2.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            All Bookings
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reservations */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Total Reservations</span>
            <Calendar className="w-5 h-5 text-gold-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal-900">{stats?.totalReservations || 0}</div>
          <span className="text-[11px] text-charcoal-500">All-time bookings</span>
        </div>

        {/* Today's Bookings */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Today's Bookings</span>
            <Clock className="w-5 h-5 text-burgundy-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal-900">{stats?.todaysBookings || 0}</div>
          <span className="text-[11px] text-charcoal-500">Arriving today</span>
        </div>

        {/* Pending Requests */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Pending Requests</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-600">{stats?.pendingBookings || 0}</div>
          <span className="text-[11px] text-charcoal-500">Requires your action</span>
        </div>

        {/* Menu Items */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Menu Dishes</span>
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal-900">{stats?.totalMenuItems || 0}</div>
          <span className="text-[11px] text-charcoal-500">{stats?.activeMenuItems || 0} published online</span>
        </div>
      </div>

      {/* Secondary Status Counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm text-center">
          <span className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">Upcoming Bookings</span>
          <div className="font-serif text-2xl font-bold text-charcoal-900 mt-0.5">{stats?.upcomingBookings || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm text-center">
          <span className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">Confirmed</span>
          <div className="font-serif text-2xl font-bold text-emerald-700 mt-0.5">{stats?.confirmedBookings || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm text-center">
          <span className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">Cancelled / Rejected</span>
          <div className="font-serif text-2xl font-bold text-charcoal-500 mt-0.5">{stats?.cancelledBookings || 0}</div>
        </div>
      </div>

      {/* Recent Reservations Table with Accept / Reject Actions */}
      <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">
              Recent Table Reservations for {currentRest?.name}
            </h3>
            <p className="text-xs text-charcoal-600 mt-0.5">
              Incoming guest bookings and dining requests for this establishment.
            </p>
          </div>
          <Link
            to="/restaurant-portal/reservations"
            className="text-xs font-bold text-burgundy-700 hover:text-burgundy-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReservations.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-500 bg-cream-50 rounded-2xl border border-cream-200">
            No reservations received yet for {currentRest?.name}. New diner bookings will appear here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-charcoal-700 text-[11px] uppercase tracking-wider border-b border-cream-300 font-bold">
                <tr>
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Customer Details</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Guests</th>
                  <th className="py-3 px-3">Pre-Order</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {recentReservations.map((res) => (
                  <tr key={res._id} className="hover:bg-cream-50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-burgundy-700 text-xs">
                      {res.bookingId}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-charcoal-900">{res.customerName}</div>
                      <div className="text-[11px] text-charcoal-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gold-600" />
                        <span>{res.customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-charcoal-800">{res.date}</div>
                      <div className="text-[11px] text-charcoal-500">{res.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-charcoal-800">{res.guestsCount} Pax</span>
                    </td>
                    <td className="py-3.5 px-3">
                      {res.menuPreference === 'YES' && res.selectedItems?.length > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                          {res.selectedItems.length} dishes (${res.estimatedFoodTotal?.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-[11px] text-charcoal-400 italic">No pre-order</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          res.status === 'confirmed' || res.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : res.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {res.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(res._id, 'confirmed')}
                            disabled={updatingId === res._id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(res._id, 'rejected')}
                            disabled={updatingId === res._id}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <Link
                          to="/restaurant-portal/reservations"
                          className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 underline"
                        >
                          View Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;

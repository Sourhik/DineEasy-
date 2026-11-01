import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import {
  Users,
  Store,
  CalendarCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

const AdminDashboard = () => {
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentReservations(res.data.recentReservations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_reservation', () => fetchStats());
      socket.on('reservation_updated', () => fetchStats());
    }
  }, [socket]);

  if (loading) {
    return <div className="p-12 text-center text-charcoal-700 font-bold">Loading admin dashboard...</div>;
  }

  const totalBookings = stats?.totalReservations || 1;
  const confirmedPct = Math.round(((stats?.confirmedReservations || 0) / totalBookings) * 100);
  const pendingPct = Math.round(((stats?.pendingReservations || 0) / totalBookings) * 100);
  const cancelledPct = Math.round(((stats?.cancelledReservations || 0) / totalBookings) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-charcoal-900">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
            Master Overview
          </span>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Super Admin Dashboard
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Full control over registered diners, restaurant partners, bookings, and platform settings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/restaurants"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-cream-200 text-charcoal-800 text-xs font-bold border border-cream-300 shadow-sm"
          >
            Manage Restaurants
          </Link>
          <Link
            to="/admin/reservations"
            className="px-5 py-2.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm"
          >
            Manage Reservations
          </Link>
        </div>
      </div>

      {/* 4 Simple Statistics Cards (Explicitly requested by user) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Total Customers</span>
            <Users className="w-5 h-5 text-gold-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal-900">{stats?.totalCustomers || 0}</div>
          <span className="text-[11px] text-charcoal-500">Registered diner accounts</span>
        </div>

        {/* Card 2: Total Restaurants */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Total Restaurants</span>
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-700">{stats?.totalRestaurants || 0}</div>
          <span className="text-[11px] text-charcoal-500">
            {stats?.pendingApprovalRestaurants ? `${stats.pendingApprovalRestaurants} pending approval` : 'All verified & active'}
          </span>
        </div>

        {/* Card 3: Total Reservations */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Total Reservations</span>
            <CalendarCheck className="w-5 h-5 text-burgundy-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-burgundy-600">{stats?.totalReservations || 0}</div>
          <span className="text-[11px] text-charcoal-500">Platform-wide table bookings</span>
        </div>

        {/* Card 4: Today's Bookings */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-bold">Today's Bookings</span>
            <Clock className="w-5 h-5 text-gold-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal-900">{stats?.todaysReservations || 0}</div>
          <span className="text-[11px] text-charcoal-500">Scheduled for today</span>
        </div>
      </div>

      {/* Booking Distribution & Food Volume */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl border border-cream-300 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-charcoal-900">
              Reservation Status Breakdown
            </h3>
            <span className="text-xs text-charcoal-500">{stats?.totalReservations || 0} total bookings</span>
          </div>

          <div className="h-4 rounded-full bg-cream-100 overflow-hidden flex border border-cream-200">
            <div style={{ width: `${confirmedPct}%` }} className="bg-emerald-600 h-full" title={`Confirmed: ${confirmedPct}%`} />
            <div style={{ width: `${pendingPct}%` }} className="bg-amber-500 h-full" title={`Pending: ${pendingPct}%`} />
            <div style={{ width: `${cancelledPct}%` }} className="bg-red-500 h-full" title={`Cancelled: ${cancelledPct}%`} />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
              <span className="text-emerald-800 font-bold block">Confirmed</span>
              <span className="text-base font-bold text-charcoal-900">{stats?.confirmedReservations || 0} ({confirmedPct}%)</span>
            </div>
            <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
              <span className="text-amber-800 font-bold block">Pending</span>
              <span className="text-base font-bold text-charcoal-900">{stats?.pendingReservations || 0} ({pendingPct}%)</span>
            </div>
            <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
              <span className="text-red-800 font-bold block">Cancelled</span>
              <span className="text-base font-bold text-charcoal-900">{stats?.cancelledReservations || 0} ({cancelledPct}%)</span>
            </div>
          </div>
        </div>

        {/* Pre-Order Food Volume Card */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-gold-600">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Food Pre-Orders</h3>
            </div>
            <p className="text-xs text-charcoal-600 mt-1">Total revenue from advance dish selections across all restaurants.</p>
          </div>

          <div>
            <div className="font-serif text-3xl font-bold text-gold-600">
              ${stats?.totalPreorderRevenue?.toFixed(2) || '0.00'}
            </div>
            <span className="text-[11px] text-charcoal-500 block mt-1">Pre-ordered through DineEasy</span>
          </div>

          <Link
            to="/admin/reservations"
            className="w-full py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-900 font-bold text-xs text-center border border-cream-300 shadow-sm"
          >
            View Pre-Order Details →
          </Link>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="rounded-3xl bg-white border border-cream-300 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Recent Table Reservations
            </h3>
            <p className="text-xs text-charcoal-600">Live platform feed across all registered dining venues.</p>
          </div>

          <Link
            to="/admin/reservations"
            className="text-xs font-bold text-burgundy-600 hover:text-burgundy-700 flex items-center gap-1"
          >
            <span>Manage All Reservations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-charcoal-600 text-[10px] uppercase tracking-wider border-b border-cream-200">
              <tr>
                <th className="py-3 px-4 font-bold">Booking ID</th>
                <th className="py-3 px-4 font-bold">Customer</th>
                <th className="py-3 px-4 font-bold">Restaurant</th>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Party Size</th>
                <th className="py-3 px-4 font-bold">Food Pre-Order</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {recentReservations.map((r) => (
                <tr key={r._id} className="hover:bg-cream-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-burgundy-600">{r.bookingId}</td>
                  <td className="py-3.5 px-4 text-charcoal-900 font-bold">{r.customerName}</td>
                  <td className="py-3.5 px-4 text-charcoal-700 font-semibold">{r.restaurantId?.name || 'Restaurant'}</td>
                  <td className="py-3.5 px-4 text-charcoal-800">
                    {r.date} at <span className="font-bold text-burgundy-600">{r.timeSlot}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-charcoal-900">{r.guestsCount} Pax</td>
                  <td className="py-3.5 px-4">
                    {r.menuPreference === 'YES' ? (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 font-bold border border-gold-300">
                        ${r.estimatedFoodTotal?.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-charcoal-400 text-[10px]">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'confirmed' || r.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : r.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {r.status === 'accepted' ? 'Confirmed' : r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

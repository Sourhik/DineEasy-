import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  X,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Edit Customer Modal
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleViewCustomer = async (cust) => {
    try {
      setSelectedCustomer(cust);
      setLoadingBookings(true);
      const res = await api.get(`/admin/customers/${cust._id}`);
      if (res.data.success) {
        setCustomerBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setEditFormData({
      name: cust.name,
      phone: cust.phone,
      status: cust.status,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put(`/admin/customers/${editingCustomer._id}`, editFormData);
      if (res.data.success) {
        setNotice(`Customer "${editFormData.name}" updated successfully.`);
        setEditingCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating customer');
    } finally {
      setSaving(false);
    }
  };

  const toggleCustomerStatus = async (cust) => {
    const newStatus = cust.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/admin/customers/${cust._id}`, { status: newStatus });
      if (res.data.success) {
        setNotice(`Customer ${cust.name} marked as ${newStatus}.`);
        fetchCustomers();
      }
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
            Customer Directory
          </span>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Manage Customers
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Store and manage customer profiles, booking history, contact details, and account activation.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-cream-300 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {['all', 'active', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl capitalize transition-all ${
                statusFilter === st
                  ? 'bg-charcoal-900 text-white font-bold shadow-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-300'
              }`}
            >
              {st} Accounts
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-600 font-bold">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-300 text-charcoal-500 text-xs shadow-sm">
          No customer records match your filter criteria.
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-cream-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-charcoal-700 text-[11px] uppercase tracking-wider border-b border-cream-300 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Login Email</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-4">Reservations</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-cream-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-charcoal-600 text-[11px] font-bold">
                      #{c._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold-100 border border-gold-300 text-gold-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-semibold">{c.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-700">{c.email}</td>
                    <td className="py-3.5 px-4 text-charcoal-700">{c.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-charcoal-600">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-cream-100 border border-cream-300 text-charcoal-800 font-bold text-[11px]">
                        {c.totalBookings || 0} bookings
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleCustomerStatus(c)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors shadow-sm ${
                          c.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewCustomer(c)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-cream-100 text-charcoal-800 border border-cream-300 font-semibold flex items-center gap-1 shadow-sm transition-all text-xs"
                          title="View Details & Booking History"
                        >
                          <Eye className="w-3.5 h-3.5 text-gold-600" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold flex items-center gap-1 shadow-sm transition-all text-xs"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5 text-gold-400" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Details & Booking History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cream-300 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold-100 border border-gold-300 text-gold-800 font-bold flex items-center justify-center font-serif text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-charcoal-600">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-2 gap-3 bg-cream-50 p-4 rounded-2xl border border-cream-300 text-xs">
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Customer ID</span>
                <div className="font-mono font-bold text-charcoal-900">#{selectedCustomer._id}</div>
              </div>
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Registered On</span>
                <div className="font-semibold text-charcoal-900">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Account Status</span>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedCustomer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Total Reservations</span>
                <div className="font-bold text-burgundy-700">{customerBookings.length} bookings</div>
              </div>
            </div>

            {/* Booking History */}
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-charcoal-900">
                Reservation History ({customerBookings.length})
              </h4>

              {loadingBookings ? (
                <div className="py-6 text-center text-xs text-charcoal-600 font-bold">Loading bookings...</div>
              ) : customerBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-charcoal-500 bg-cream-50 rounded-2xl border border-cream-200">
                  No reservations placed yet by this customer.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {customerBookings.map((b) => (
                    <div
                      key={b._id}
                      className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-burgundy-700">{b.bookingId}</div>
                        <div className="text-charcoal-900 font-bold">{b.restaurantId?.name || 'Restaurant'}</div>
                        <div className="text-[11px] text-charcoal-600">{b.date} at {b.timeSlot} • {b.guestsCount} Guests</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed' || b.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : b.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.menuPreference === 'YES' && (
                          <div className="text-[11px] text-gold-700 font-bold mt-1">Pre-ordered: ${b.estimatedFoodTotal?.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-cream-200 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cream-300 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Edit Customer Info</h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="w-7 h-7 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-charcoal-800">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-charcoal-800">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-charcoal-800">Account Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white font-semibold"
                >
                  <option value="active">Active (Full Booking Privileges)</option>
                  <option value="inactive">Inactive / Suspended</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 py-2.5 rounded-xl bg-cream-100 text-charcoal-700 font-bold hover:bg-cream-200 border border-cream-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-burgundy-600 text-white font-bold hover:bg-burgundy-700 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;

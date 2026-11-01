import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Store,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  UtensilsCrossed,
  X,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Sparkles,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add Restaurant Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: 'password123',
    phone: '',
    address: '',
    city: 'Metropolis',
    cuisine: 'Contemporary, Fine Dining',
    description: '',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    totalTables: 12,
  });

  // View Menu Modal
  const [viewingMenuRest, setViewingMenuRest] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Edit Restaurant Modal
  const [editingRest, setEditingRest] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/restaurants', { params });
      if (res.data.success) {
        setRestaurants(res.data.restaurants);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/restaurants', newRestaurant);
      if (res.data.success) {
        setNotice(`Restaurant "${newRestaurant.name}" added successfully with manager credentials.`);
        setIsAddModalOpen(false);
        setNewRestaurant({
          name: '',
          ownerName: '',
          ownerEmail: '',
          ownerPhone: '',
          ownerPassword: 'password123',
          phone: '',
          address: '',
          city: 'Metropolis',
          cuisine: 'Contemporary, Fine Dining',
          description: '',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
          logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
          totalTables: 12,
        });
        fetchRestaurants();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating restaurant');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/admin/restaurants/${id}/status`, { status });
      if (res.data.success) {
        setNotice(`Restaurant status changed to "${status}".`);
        fetchRestaurants();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleViewMenu = async (r) => {
    try {
      setViewingMenuRest(r);
      setLoadingMenu(true);
      const res = await api.get(`/admin/restaurants/${r._id}/menu`);
      if (res.data.success) {
        setRestaurantMenu(res.data.menuItems || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleOpenEdit = (r) => {
    setEditingRest(r);
    setEditFormData({
      name: r.name,
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      city: r.city || '',
      cuisine: Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine || '',
      description: r.description || '',
      status: r.status,
      totalTables: r.totalTables || 10,
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put(`/admin/restaurants/${editingRest._id}`, editFormData);
      if (res.data.success) {
        setNotice(`Restaurant "${editingRest.name}" updated successfully.`);
        setEditingRest(null);
        fetchRestaurants();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating restaurant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
            Establishments Catalog
          </span>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Manage Restaurants
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Onboard new venues, approve or reject applications, edit profiles, and view menus & reservations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white border border-cream-300 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by restaurant name, address, cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {['all', 'active', 'pending', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl capitalize transition-all ${
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

      {/* Restaurants List Table */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-600 font-bold">Loading restaurants...</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-300 text-charcoal-500 text-xs shadow-sm">
          No restaurants match the selected criteria.
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-cream-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-charcoal-700 text-[11px] uppercase tracking-wider border-b border-cream-300 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Restaurant</th>
                  <th className="py-3.5 px-4">Owner & Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Cuisine</th>
                  <th className="py-3.5 px-4">Menu Items</th>
                  <th className="py-3.5 px-4">Reservations</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {restaurants.map((r) => (
                  <tr key={r._id} className="hover:bg-cream-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.image || r.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80'}
                          alt={r.name}
                          className="w-11 h-11 rounded-xl object-cover border border-cream-300 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-charcoal-900 text-sm">{r.name}</div>
                          <span className="font-mono text-[10px] text-charcoal-500">ID: #{r._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">{r.ownerId?.name || 'Owner Assigned'}</div>
                      <div className="text-[11px] text-charcoal-600">{r.email || r.ownerId?.email}</div>
                      <div className="text-[11px] text-charcoal-500">{r.phone || r.ownerId?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-700 max-w-xs truncate">
                      {r.address}, {r.city}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-cream-100 text-charcoal-800 text-[11px] font-semibold">
                        {Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleViewMenu(r)}
                        className="px-2.5 py-1 rounded-lg bg-gold-50 border border-gold-300 text-gold-900 font-bold hover:bg-gold-100 flex items-center gap-1 text-[11px]"
                      >
                        <UtensilsCrossed className="w-3 h-3 text-gold-700" />
                        <span>{r.totalMenuItems || 0} items</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/admin/reservations?restaurantId=${r._id}`}
                        className="px-2.5 py-1 rounded-lg bg-cream-100 border border-cream-300 text-charcoal-800 font-bold hover:bg-cream-200 text-[11px] inline-flex items-center gap-1"
                      >
                        <CalendarDays className="w-3 h-3 text-burgundy-700" />
                        <span>{r.totalReservations || 0}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                          r.status === 'active' || r.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : r.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="inactive">Inactive</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold flex items-center gap-1 shadow-sm text-xs"
                          title="Edit Restaurant"
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

      {/* Add Restaurant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cream-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900">Add New Restaurant</h3>
                <p className="text-xs text-charcoal-600 mt-0.5">Register venue and create restaurant manager login.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                    placeholder="e.g. The Grand Trattoria"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Cuisine Types</label>
                  <input
                    type="text"
                    required
                    value={newRestaurant.cuisine}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                    placeholder="e.g. Italian, Continental, Seafood"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Owner / Manager Name</label>
                  <input
                    type="text"
                    required
                    value={newRestaurant.ownerName}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, ownerName: e.target.value })}
                    placeholder="e.g. Marco Rossi"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Owner Login Email *</label>
                  <input
                    type="email"
                    required
                    value={newRestaurant.ownerEmail}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, ownerEmail: e.target.value })}
                    placeholder="manager@restaurant.com"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Owner Phone (OTP Enabled)</label>
                  <input
                    type="tel"
                    required
                    value={newRestaurant.ownerPhone}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, ownerPhone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">City</label>
                  <input
                    type="text"
                    required
                    value={newRestaurant.city}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, city: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Total Tables</label>
                  <input
                    type="number"
                    min="1"
                    value={newRestaurant.totalTables}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, totalTables: parseInt(e.target.value) || 1 })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Address *</label>
                <input
                  type="text"
                  required
                  value={newRestaurant.address}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                  placeholder="e.g. 104 Waterfront Boulevard"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Description</label>
                <textarea
                  rows="2"
                  value={newRestaurant.description}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                  placeholder="Brief culinary highlight for customer discovery..."
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-cream-100 text-charcoal-700 font-bold hover:bg-cream-200 border border-cream-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-burgundy-600 text-white font-bold hover:bg-burgundy-700 shadow-sm"
                >
                  {saving ? 'Creating...' : 'Register Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Menu Modal */}
      {viewingMenuRest && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cream-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cream-200 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={viewingMenuRest.image || viewingMenuRest.logo}
                  alt={viewingMenuRest.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cream-300"
                />
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">{viewingMenuRest.name}</h3>
                  <p className="text-xs text-charcoal-600">Live Customer Menu Catalog ({restaurantMenu.length} dishes)</p>
                </div>
              </div>
              <button
                onClick={() => setViewingMenuRest(null)}
                className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingMenu ? (
              <div className="py-12 text-center text-charcoal-600 font-bold">Loading restaurant menu...</div>
            ) : restaurantMenu.length === 0 ? (
              <div className="py-12 text-center text-xs text-charcoal-500 bg-cream-50 rounded-2xl border border-cream-300">
                This restaurant has not added any dishes to its menu yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {restaurantMenu.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-2xl bg-cream-50 border border-cream-300 flex items-center gap-3"
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-cream-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-charcoal-900 text-xs truncate">{item.name}</h5>
                        <span className="font-serif font-bold text-burgundy-700 text-xs shrink-0">${item.price?.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] text-charcoal-500 uppercase font-semibold">{item.category}</span>
                      <p className="text-[11px] text-charcoal-600 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-cream-200 flex justify-end">
              <button
                onClick={() => setViewingMenuRest(null)}
                className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {editingRest && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cream-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Edit Restaurant Profile</h3>
              <button
                onClick={() => setEditingRest(null)}
                className="w-7 h-7 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Cuisine Types (Comma separated)</label>
                <input
                  type="text"
                  value={editFormData.cuisine}
                  onChange={(e) => setEditFormData({ ...editFormData, cuisine: e.target.value })}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="inactive">Inactive</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Total Tables</label>
                  <input
                    type="number"
                    value={editFormData.totalTables}
                    onChange={(e) => setEditFormData({ ...editFormData, totalTables: parseInt(e.target.value) || 1 })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingRest(null)}
                  className="flex-1 py-2.5 rounded-xl bg-cream-100 text-charcoal-700 font-bold hover:bg-cream-200 border border-cream-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-burgundy-600 text-white font-bold hover:bg-burgundy-700 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;

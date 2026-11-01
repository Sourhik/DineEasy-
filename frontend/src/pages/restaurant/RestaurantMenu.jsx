import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useActiveRestaurant } from '../../context/RestaurantContext';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UtensilsCrossed,
  Search,
  AlertCircle,
  X,
  Upload,
  Check,
  Image as ImageIcon,
  ArrowLeftRight,
} from 'lucide-react';

const RestaurantMenu = () => {
  const { activeRestaurant, refreshTrigger, openSwitchModal } = useActiveRestaurant();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    description: '',
    price: '',
    image: '',
    dietary: 'non-veg',
    isAvailable: true,
    isPublished: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Drinks', 'Chef Specials'];

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurant/menu');
      if (res.data.success) {
        setMenuItems(res.data.menuItems);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [refreshTrigger, activeRestaurant?._id]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Main Course',
      description: '',
      price: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
      dietary: 'non-veg',
      isAvailable: true,
      isPublished: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      price: item.price,
      image: item.image,
      dietary: item.dietary || 'non-veg',
      isAvailable: item.isAvailable,
      isPublished: item.isPublished,
    });
    setError('');
    setIsModalOpen(true);
  };

  // Direct Image File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
      }
    } catch (err) {
      alert('Failed to upload image. Please try a valid image file (JPG, PNG).');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      if (!formData.name || !formData.price) {
        setError('Dish name and price are required');
        return;
      }

      if (editingItem) {
        const res = await api.put(`/restaurant/menu/${editingItem._id}`, formData);
        if (res.data.success) {
          setMessage('Menu item updated and automatically synchronized with the customer website!');
          setIsModalOpen(false);
          fetchMenu();
        }
      } else {
        const res = await api.post('/restaurant/menu', formData);
        if (res.data.success) {
          setMessage('New dish created and published to the customer website!');
          setIsModalOpen(false);
          fetchMenu();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the menu? It will disappear from the customer website.`)) return;
    try {
      const res = await api.delete(`/restaurant/menu/${id}`);
      if (res.data.success) {
        setMessage(`Dish "${name}" deleted and removed from the customer website.`);
        fetchMenu();
      }
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const res = await api.put(`/restaurant/menu/${item._id}`, {
        isAvailable: !item.isAvailable,
      });
      if (res.data.success) {
        fetchMenu();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const togglePublished = async (item) => {
    try {
      const res = await api.put(`/restaurant/menu/${item._id}`, {
        isPublished: !item.isPublished,
      });
      if (res.data.success) {
        fetchMenu();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredItems = menuItems.filter((i) => {
    const matchesCat = categoryFilter === 'All' || i.category === categoryFilter;
    const matchesSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-charcoal-900">
      {/* Top Header with Active Restaurant Badge & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
              Menu Catalog
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-charcoal-900 text-gold-400">
              {activeRestaurant?.restaurantCode || 'REST001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Menu — {activeRestaurant?.name || 'Manage Menu'}
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Add dishes, upload images, update prices, and control published availability for this venue.
          </p>
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
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between font-bold">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-charcoal-500 font-bold">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-cream-300 rounded-3xl p-5 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-gold-600 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Dishes Grid */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-700 font-bold">Loading dishes...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-300 shadow-sm space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-gold-600 mx-auto" />
          <h3 className="font-serif text-base font-bold text-charcoal-900">No dishes found</h3>
          <p className="text-xs text-charcoal-500">Click "+ Add New Dish" above to create food items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between bg-white shadow-sm hover:shadow-md ${
                item.isPublished
                  ? 'border-cream-300'
                  : 'border-dashed border-amber-300 bg-amber-50/30'
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />

                {/* Dietary badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      item.dietary === 'veg'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {item.dietary}
                  </span>
                </div>

                {/* Category badge */}
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-white/95 shadow-sm text-[10px] font-bold text-charcoal-800">
                  {item.category}
                </div>
              </div>

              {/* Dish info */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-bold text-charcoal-900">{item.name}</h4>
                    <span className="text-base font-bold text-burgundy-600">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Toggles */}
                <div className="pt-3 border-t border-cream-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-600 font-semibold">Kitchen Stock:</span>
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock / Ready' : 'Sold Out'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-600 font-semibold">Customer Website:</span>
                    <button
                      onClick={() => togglePublished(item)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        item.isPublished
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {item.isPublished ? 'Visible (Live)' : 'Hidden (Draft)'}
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cream-200">
                  <button
                    onClick={() => openEditModal(item)}
                    className="py-2 px-3 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-cream-300 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5 text-gold-600" />
                    <span>Edit Dish</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-red-200 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal with Direct Image File Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-cream-300 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                {editingItem ? 'Edit Dish Details' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Signature Truffle Alfredo"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Chef Specials">Chef Specials</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-charcoal-800">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 24.50"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, culinary prep, allergens..."
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              {/* Direct Image File Upload & Preview */}
              <div className="space-y-2 p-4 rounded-2xl bg-cream-50 border border-cream-300">
                <label className="font-bold text-charcoal-800 flex items-center justify-between">
                  <span>Upload Food Photo Directly</span>
                  {uploadingImage && <span className="text-gold-600 font-bold">Uploading...</span>}
                </label>

                <div className="flex items-center gap-3">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-cream-300 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-cream-300 flex items-center justify-center text-charcoal-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-charcoal-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-cream-300 file:text-xs file:font-bold file:bg-white file:text-charcoal-800 hover:file:bg-cream-100 cursor-pointer"
                    />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or paste external image URL..."
                      className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs text-charcoal-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-charcoal-800">Dietary Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['veg', 'non-veg', 'vegan'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, dietary: type })}
                      className={`py-2 rounded-xl uppercase text-[11px] font-bold border transition-colors ${
                        formData.dietary === type
                          ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-sm'
                          : 'bg-cream-50 text-charcoal-700 border-cream-300 hover:bg-cream-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-cream-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="accent-burgundy-600 w-4 h-4"
                  />
                  <span className="text-charcoal-800 font-bold">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="accent-burgundy-600 w-4 h-4"
                  />
                  <span className="text-charcoal-800 font-bold">Publish to Customer Site</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-cream-100 text-charcoal-700 font-bold hover:bg-cream-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 py-3 rounded-xl bg-burgundy-600 text-white font-bold hover:bg-burgundy-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;

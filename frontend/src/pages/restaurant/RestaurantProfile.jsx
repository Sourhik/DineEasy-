import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useActiveRestaurant } from '../../context/RestaurantContext';
import { Building, Phone, Mail, MapPin, Clock, Check, AlertCircle, Upload, Image as ImageIcon, ArrowLeftRight } from 'lucide-react';

const RestaurantProfile = () => {
  const { activeRestaurant, refreshTrigger, openSwitchModal } = useActiveRestaurant();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    openingHours: '',
    cuisine: '',
    image: '',
    logo: '',
    totalTables: 12,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [refreshTrigger, activeRestaurant?._id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurant/profile');
      if (res.data.success) {
        const r = res.data.restaurant;
        setProfile(r);
        setFormData({
          name: r.name || '',
          description: r.description || '',
          phone: r.phone || '',
          email: r.email || '',
          address: r.address || '',
          city: r.city || '',
          openingHours: r.openingHours || '',
          cuisine: Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine || '',
          image: r.image || '',
          logo: r.logo || '',
          totalTables: r.totalTables || 12,
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (type === 'image') setUploadingImage(true);
      if (type === 'logo') setUploadingLogo(true);

      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setFormData((prev) => ({ ...prev, [type]: res.data.url }));
      }
    } catch (err) {
      alert('Failed to upload image. Please try a valid JPG or PNG.');
    } finally {
      if (type === 'image') setUploadingImage(false);
      if (type === 'logo') setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      const res = await api.put('/restaurant/profile', formData);
      if (res.data.success) {
        setMessage('Restaurant profile updated! Details are synchronized with the customer website.');
        setProfile(res.data.restaurant);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-charcoal-700 font-bold">Loading restaurant profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-charcoal-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
              Profile Settings
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-charcoal-900 text-gold-400">
              {activeRestaurant?.restaurantCode || 'REST001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Profile — {activeRestaurant?.name || 'Restaurant Profile'}
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Update venue contact information, photography, address, and operating hours.
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

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between font-bold">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {message}
          </span>
          <button onClick={() => setMessage('')} className="text-charcoal-500 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Cover Preview */}
        <div className="relative h-48 rounded-2xl overflow-hidden border border-cream-300 shadow-sm">
          <img src={formData.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <img
              src={formData.logo}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white bg-white shadow-md"
            />
            <div className="text-white">
              <div className="font-serif font-bold text-xl">{formData.name}</div>
              <div className="text-xs text-cream-200">{formData.cuisine}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-charcoal-800">Restaurant Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-800">Contact Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-800">Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-800">Operating Hours *</label>
            <input
              type="text"
              required
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              placeholder="e.g. 11:30 AM - 11:00 PM"
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-bold text-charcoal-800">Street Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-800">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-800">Cuisine Types</label>
            <input
              type="text"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              placeholder="e.g. Italian, Mediterranean, Pizza"
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Photo Uploaders */}
          <div className="space-y-2 p-4 rounded-2xl bg-cream-50 border border-cream-300 sm:col-span-2">
            <label className="font-bold text-charcoal-800 flex justify-between">
              <span>Cover Photo (Direct Upload or URL)</span>
              {uploadingImage && <span className="text-gold-600 font-bold">Uploading...</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'image')}
                className="block text-xs text-charcoal-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-cream-300 file:text-xs file:font-bold file:bg-white file:text-charcoal-800 cursor-pointer"
              />
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Or paste image URL..."
                className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-1.5 text-xs text-charcoal-900"
              />
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-cream-50 border border-cream-300 sm:col-span-2">
            <label className="font-bold text-charcoal-800 flex justify-between">
              <span>Logo Photo (Direct Upload or URL)</span>
              {uploadingLogo && <span className="text-gold-600 font-bold">Uploading...</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
                className="block text-xs text-charcoal-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-cream-300 file:text-xs file:font-bold file:bg-white file:text-charcoal-800 cursor-pointer"
              />
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="Or paste logo URL..."
                className="flex-1 bg-white border border-cream-300 rounded-xl px-3 py-1.5 text-xs text-charcoal-900"
              />
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-bold text-charcoal-800">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploadingImage || uploadingLogo}
          className="w-full py-3.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantProfile;

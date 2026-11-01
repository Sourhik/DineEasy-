import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, Check, AlertCircle } from 'lucide-react';

const CustomerProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      await updateProfile({ name, phone, profileImage });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-page py-16 px-4 sm:px-6 lg:px-8 text-charcoal-900">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title">Customer Profile</h1>
          <p className="text-xs theme-canvas-sub mt-1">Manage your personal contact details used for reservations.</p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-cream-200 pb-6">
            <img
              src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-500 shadow-sm"
            />
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">{user?.name}</h3>
              <p className="text-xs text-charcoal-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-cream-100 text-charcoal-700 text-[10px] font-bold uppercase border border-cream-300">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-charcoal-800">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-charcoal-800">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-cream-200 border border-cream-300 rounded-xl px-4 py-2.5 text-charcoal-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-charcoal-800">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-charcoal-800">Avatar Image URL</label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfilePage;

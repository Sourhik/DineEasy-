import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Shield,
  Mail,
  Phone,
  Check,
  AlertCircle,
  Sparkles,
  LogOut,
  Building,
  Bell,
  Sliders,
} from 'lucide-react';

const AdminSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'DineEasy',
    supportEmail: 'support@dineeasy.com',
    supportPhone: '+1 (800) 555-DINE',
    autoApproveRestaurants: false,
    cancellationWindowHours: 2,
  });

  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminPhone, setAdminPhone] = useState(user?.phone || '');
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.success && res.data.settings) {
        setPlatformSettings(res.data.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePlatformSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingPlatform(true);
      const res = await api.put('/admin/settings', platformSettings);
      if (res.data.success) {
        setNotice('Platform system configuration updated successfully.');
      }
    } catch (err) {
      alert('Error saving platform settings');
    } finally {
      setSavingPlatform(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile({ name: adminName, phone: adminPhone });
      setNotice('Super Administrator profile updated.');
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-charcoal-900">
      <div className="border-b theme-canvas-border pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
          System Administration
        </span>
        <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
          Platform Settings & Admin Profile
        </h1>
        <p className="text-xs theme-canvas-sub mt-0.5">
          Configure global marketplace defaults, customer support hotline, and super administrator security.
        </p>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {notice}
          </span>
          <button onClick={() => setNotice('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Platform Settings Form */}
      <form onSubmit={handleSavePlatformSettings} className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
          <Sliders className="w-5 h-5 text-burgundy-700" />
          <h3 className="font-serif text-lg font-bold text-charcoal-900">
            Platform System Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-charcoal-800">Platform Brand Name</label>
            <input
              type="text"
              value={platformSettings.platformName || ''}
              onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-charcoal-800">Support Email</label>
            <input
              type="email"
              value={platformSettings.supportEmail || ''}
              onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-charcoal-800">Support Phone / Help Desk</label>
            <input
              type="text"
              value={platformSettings.supportPhone || ''}
              onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-charcoal-800">Cancellation Window (Hours before booking)</label>
            <input
              type="number"
              min="0"
              value={platformSettings.cancellationWindowHours || 2}
              onChange={(e) =>
                setPlatformSettings({ ...platformSettings, cancellationWindowHours: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Checkbox: Auto Approve Restaurants */}
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 flex items-center justify-between">
          <div>
            <div className="font-bold text-charcoal-900 text-xs">Automatic Restaurant Onboarding</div>
            <p className="text-[11px] text-charcoal-600 mt-0.5">
              If enabled, newly registered partner venues bypass manual super admin review and become active immediately.
            </p>
          </div>
          <input
            type="checkbox"
            checked={platformSettings.autoApproveRestaurants || false}
            onChange={(e) =>
              setPlatformSettings({ ...platformSettings, autoApproveRestaurants: e.target.checked })
            }
            className="w-5 h-5 rounded text-burgundy-600 focus:ring-burgundy-500 cursor-pointer"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingPlatform}
            className="px-6 py-2.5 rounded-xl bg-burgundy-600 text-white font-bold text-xs hover:bg-burgundy-700 shadow-sm"
          >
            {savingPlatform ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>

      {/* Admin Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
          <Shield className="w-5 h-5 text-burgundy-700" />
          <h3 className="font-serif text-lg font-bold text-charcoal-900">
            Super Admin Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-charcoal-800">Admin Display Name</label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-charcoal-800">Admin Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-600 cursor-not-allowed font-medium"
            />
            <span className="text-[10px] text-charcoal-500">Root credentials cannot be altered in dashboard.</span>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-charcoal-800">Phone Number</label>
            <input
              type="tel"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="+1 555-0100"
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2.5 rounded-xl bg-charcoal-900 text-white font-bold text-xs hover:bg-charcoal-800 shadow-sm"
          >
            {savingProfile ? 'Updating...' : 'Update Admin Profile'}
          </button>
        </div>
      </form>

      {/* Logout Box */}
      <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-charcoal-900 text-sm">Terminate Administrator Session</h4>
          <p className="text-xs text-charcoal-600 mt-0.5">Securely log out of the Super Admin Control Room on this device.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-sm flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Secure Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;

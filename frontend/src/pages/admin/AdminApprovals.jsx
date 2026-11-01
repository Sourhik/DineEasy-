import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CheckCircle,
  XCircle,
  Clock,
  Store,
  MapPin,
  Phone,
  Mail,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
  Check,
  Eye,
} from 'lucide-react';

const AdminApprovals = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/restaurants');
      if (res.data.success) {
        setRestaurants(res.data.restaurants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleUpdateStatus = async (restaurantId, newStatus, restaurantName) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/restaurants/${restaurantId}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        setNotice(`Restaurant "${restaurantName}" has been successfully ${newStatus === 'active' || newStatus === 'approved' ? 'approved & activated' : 'rejected'}.`);
        fetchRestaurants();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating restaurant approval');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered lists
  const pendingList = restaurants.filter((r) => r.status === 'pending');
  const approvedList = restaurants.filter((r) => r.status === 'active' || r.status === 'approved');
  const rejectedList = restaurants.filter((r) => r.status === 'rejected');

  const currentDisplayList =
    statusTab === 'pending'
      ? pendingList
      : statusTab === 'approved'
      ? approvedList
      : rejectedList;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-charcoal-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
            Vetting & Compliance
          </span>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Restaurant Approval Requests
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Review partner restaurant applications, verify manager contact info, and grant platform access.
          </p>
        </div>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusTab('pending')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusTab === 'pending'
              ? 'bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white border-cream-300 hover:bg-cream-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-600">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-charcoal-900 mt-2">
            {pendingList.length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting super admin action</span>
        </button>

        <button
          onClick={() => setStatusTab('approved')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusTab === 'approved'
              ? 'bg-emerald-50 border-emerald-300 shadow-md ring-2 ring-emerald-400/40'
              : 'bg-white border-cream-300 hover:bg-cream-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-600">Approved & Active</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-charcoal-900 mt-2">
            {approvedList.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Live on customer website</span>
        </button>

        <button
          onClick={() => setStatusTab('rejected')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusTab === 'rejected'
              ? 'bg-red-50 border-red-300 shadow-md ring-2 ring-red-400/40'
              : 'bg-white border-cream-300 hover:bg-cream-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-600">Rejected Requests</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-charcoal-900 mt-2">
            {rejectedList.length}
          </div>
          <span className="text-[11px] text-red-700 font-medium">Declined or suspended venues</span>
        </button>
      </div>

      {/* Main Approval List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 capitalize">
            {statusTab} Applications ({currentDisplayList.length})
          </h3>
          <span className="text-xs text-charcoal-500 font-semibold">
            Click Approve to immediately grant diner booking visibility.
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-charcoal-600 font-bold bg-white rounded-3xl border border-cream-300">
            Loading approval requests...
          </div>
        ) : currentDisplayList.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-cream-300 text-charcoal-500 text-xs shadow-sm space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
            <p className="font-bold text-charcoal-800 text-sm">
              {statusTab === 'pending'
                ? 'No pending applications! All registered restaurants are up to date.'
                : `No ${statusTab} restaurant records found.`}
            </p>
            <p className="text-charcoal-500">
              When new restaurant managers register, their onboarding profiles will appear here for verification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentDisplayList.map((rest) => (
              <div
                key={rest._id}
                className="p-6 rounded-3xl bg-white border border-cream-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={rest.image || rest.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
                    alt={rest.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-cream-300 shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-charcoal-900">{rest.name}</h4>
                      <span className="font-mono text-[10px] text-charcoal-500 bg-cream-100 px-2 py-0.5 rounded font-bold">
                        #{rest._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal-600 line-clamp-2">{rest.description || 'No description provided.'}</p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-charcoal-600 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-charcoal-800">
                        <MapPin className="w-3.5 h-3.5 text-burgundy-700" />
                        {rest.address}, {rest.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-gold-600" />
                        {Array.isArray(rest.cuisine) ? rest.cuisine.join(', ') : rest.cuisine}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                        {rest.ownerId?.email || rest.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                        {rest.ownerId?.phone || rest.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-cream-200">
                  {statusTab === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(rest._id, 'active', rest.name)}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Activate</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rest._id, 'rejected', rest.name)}
                        disabled={actionLoading}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : statusTab === 'approved' ? (
                    <button
                      onClick={() => handleUpdateStatus(rest._id, 'inactive', rest.name)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-cream-100 hover:bg-red-50 hover:text-red-700 text-charcoal-700 border border-cream-300 font-bold text-xs transition-all"
                    >
                      Suspend Access
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(rest._id, 'active', rest.name)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
                    >
                      Re-Approve Venue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovals;


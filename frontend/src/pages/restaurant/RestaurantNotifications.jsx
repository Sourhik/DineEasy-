import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useActiveRestaurant } from '../../context/RestaurantContext';
import { Bell, CheckCheck, Clock, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RestaurantNotifications = () => {
  const { socket } = useSocket();
  const { activeRestaurant, refreshTrigger, openSwitchModal } = useActiveRestaurant();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [refreshTrigger, activeRestaurant?._id]);

  useEffect(() => {
    if (socket) {
      socket.on('new_reservation', () => fetchNotifications());
    }
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-charcoal-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b theme-canvas-border pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm inline-block">
              Activity Alerts
            </span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-charcoal-900 text-gold-400">
              {activeRestaurant?.restaurantCode || 'REST001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold theme-canvas-title mt-2">
            Notifications — {activeRestaurant?.name || 'Booking Notifications'}
          </h1>
          <p className="text-xs theme-canvas-sub mt-0.5">
            Real-time alerts for customer reservations and status updates for this establishment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openSwitchModal}
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-charcoal-900" />
            <span>Switch Restaurant</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-cream-200 text-charcoal-800 text-xs font-bold border border-cream-300 shadow-sm flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All As Read</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-charcoal-600 font-bold">Loading alerts...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-cream-300 shadow-sm space-y-2">
          <Bell className="w-12 h-12 text-gold-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-charcoal-900">No notifications yet</h3>
          <p className="text-xs text-charcoal-500">New customer table requests will appear here instantly.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-white border-burgundy-300 shadow-sm ring-1 ring-burgundy-200'
                  : 'bg-cream-50 border-cream-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-burgundy-50 border border-burgundy-200 flex items-center justify-center text-burgundy-600 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal-900">{n.title}</h4>
                  <p className="text-xs text-charcoal-600 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-charcoal-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString()} • {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate('/restaurant-portal/reservations')}
                  className="px-3 py-1.5 rounded-lg bg-burgundy-600 text-white font-bold text-xs"
                >
                  View
                </button>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantNotifications;


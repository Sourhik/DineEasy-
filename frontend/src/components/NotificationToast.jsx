import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationToast = () => {
  const { liveNotification, clearLiveNotification } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (liveNotification) {
      const timer = setTimeout(() => {
        clearLiveNotification();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [liveNotification]);

  if (!liveNotification) return null;

  const handleClick = () => {
    if (liveNotification.type === 'new_reservation') {
      navigate('/restaurant-portal/reservations');
    } else {
      navigate('/my-bookings');
    }
    clearLiveNotification();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce">
      <div className="bg-white border-2 border-gold-500 rounded-2xl p-4 shadow-2xl text-charcoal-900 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center shrink-0 border border-gold-200">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-xs text-charcoal-900 flex items-center gap-1.5">
            {liveNotification.title}
          </h5>
          <p className="text-xs text-charcoal-600 mt-1 line-clamp-2">
            {liveNotification.message}
          </p>
          <button
            onClick={handleClick}
            className="mt-2 text-xs font-bold text-burgundy-600 hover:text-burgundy-700 flex items-center gap-1"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={clearLiveNotification}
          className="text-charcoal-400 hover:text-charcoal-800 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RestaurantProvider, useActiveRestaurant } from '../../context/RestaurantContext';
import RestaurantSwitchModal from '../../components/RestaurantSwitchModal';
import {
  LayoutDashboard,
  CalendarCheck,
  UtensilsCrossed,
  Building,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  ArrowLeftRight,
  MapPin,
  ShieldCheck,
  Check,
} from 'lucide-react';

const RestaurantLayoutInner = () => {
  const { user, logout } = useAuth();
  const { activeRestaurant, availableRestaurants, openSwitchModal } = useActiveRestaurant();
  const location = useLocation();
  const navigate = useNavigate();

  // Exact 7 sidebar options requested by user
  const navItems = [
    { label: 'Dashboard', path: '/restaurant-portal', icon: LayoutDashboard },
    { label: 'My Reservations', path: '/restaurant-portal/reservations', icon: CalendarCheck },
    { label: 'Manage Menu', path: '/restaurant-portal/menu', icon: UtensilsCrossed },
    { label: 'Restaurant Profile', path: '/restaurant-portal/profile', icon: Building },
    { label: 'Notifications', path: '/restaurant-portal/notifications', icon: Bell },
    { label: 'Settings', path: '/restaurant-portal/settings', icon: Settings },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <div className="min-h-screen bg-theme-page text-charcoal-900 flex flex-col md:flex-row">
      {/* Modal Popup for Switching Restaurants */}
      <RestaurantSwitchModal />

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-charcoal-900 border-r border-charcoal-800 p-5 flex flex-col justify-between shrink-0 text-cream-100 shadow-xl">
        <div className="space-y-5">
          {/* Active Restaurant Header & Switcher */}
          <div className="space-y-3 border-b border-charcoal-800 pb-5">
            <div className="flex items-start gap-3">
              <img
                src={
                  activeRestaurant?.logo ||
                  activeRestaurant?.image ||
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80'
                }
                alt={activeRestaurant?.name || 'Restaurant'}
                className="w-12 h-12 rounded-xl object-cover border border-gold-500/40 shrink-0 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-serif font-bold text-base text-white truncate">
                    {activeRestaurant?.name || user?.restaurant?.name || 'The Royal Saffron'}
                  </h2>
                  <span className="font-mono text-[10px] bg-charcoal-800 text-gold-400 border border-charcoal-700 px-1.5 py-0.5 rounded font-bold">
                    {activeRestaurant?.restaurantCode || 'REST001'}
                  </span>
                </div>
                <div className="text-[11px] text-cream-400 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-burgundy-400 shrink-0" />
                  <span className="truncate">{activeRestaurant?.address || 'Downtown'}</span>
                </div>
              </div>
            </div>

            {/* Clearly Visible Switch Restaurant Button in Sidebar */}
            <button
              type="button"
              onClick={openSwitchModal}
              className="w-full py-2.5 px-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-md flex items-center justify-between gap-2 transition-all transform active:scale-95"
              title="Switch Active Restaurant"
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-charcoal-900" />
                <span>Switch Restaurant</span>
              </div>
              <span className="text-[10px] bg-charcoal-900/20 px-2 py-0.5 rounded-full font-bold">
                {availableRestaurants.length} available
              </span>
            </button>

            {/* Logged in Manager summary */}
            <div className="p-3 rounded-xl bg-charcoal-800/90 border border-charcoal-700/60 text-xs text-cream-300">
              <div className="text-[10px] text-cream-400 uppercase font-semibold flex items-center justify-between">
                <span>Account Manager</span>
                <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="font-bold text-white truncate mt-0.5">{user?.name}</div>
              <div className="text-[11px] text-gold-400 truncate">{user?.email}</div>
            </div>
          </div>

          {/* Navigation Items (Exact 7 options) */}
          <nav className="space-y-1 text-xs font-bold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-burgundy-600 text-white shadow-md'
                      : 'text-cream-300 hover:bg-charcoal-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-cream-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Diner Site & Logout */}
        <div className="pt-5 border-t border-charcoal-800 space-y-2 text-xs font-bold">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-cream-300 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gold-400" />
            <span>Customer Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-charcoal-800 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Top Navigation Bar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar with Switch Restaurant controls */}
        <header className="bg-white border-b border-cream-300 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={
                activeRestaurant?.logo ||
                activeRestaurant?.image ||
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80'
              }
              alt={activeRestaurant?.name}
              className="w-9 h-9 rounded-xl object-cover border border-cream-300 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-bold text-charcoal-900 text-sm truncate">
                  {activeRestaurant?.name || 'Restaurant Dashboard'}
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cream-100 text-burgundy-700 border border-cream-300">
                  {activeRestaurant?.restaurantCode || 'REST001'}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    activeRestaurant?.status === 'active' || activeRestaurant?.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeRestaurant?.status || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                {activeRestaurant?.address}, {activeRestaurant?.city}
              </p>
            </div>
          </div>

          {/* Top Bar Switch Restaurant Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openSwitchModal}
              className="px-4 py-2 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all transform active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4 text-gold-300" />
              <span>Switch Restaurant</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const RestaurantLayout = () => {
  return (
    <RestaurantProvider>
      <RestaurantLayoutInner />
    </RestaurantProvider>
  );
};

export default RestaurantLayout;

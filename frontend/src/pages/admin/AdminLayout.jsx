import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  CalendarDays,
  CheckCircle,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Exact 7 sidebar options requested by user
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Customers', path: '/admin/customers', icon: Users },
    { label: 'Manage Restaurants', path: '/admin/restaurants', icon: Store },
    { label: 'Manage Reservations', path: '/admin/reservations', icon: CalendarDays },
    { label: 'Restaurant Approval', path: '/admin/approvals', icon: CheckCircle },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <div className="min-h-screen bg-theme-page text-charcoal-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800 p-5 flex flex-col justify-between shrink-0 text-cream-100">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3 border-b border-charcoal-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-base text-white truncate">
                  Super Admin
                </h2>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Full System Control
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-800 text-xs text-cream-300">
              <div className="text-[10px] text-cream-400 uppercase font-semibold">Administrator</div>
              <div className="font-bold text-white truncate mt-0.5">{user?.name}</div>
              <div className="text-[11px] text-gold-400 truncate">{user?.email}</div>
            </div>
          </div>

          {/* Navigation Items (Exact 7 options) */}
          <nav className="space-y-1.5 text-xs font-bold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-gold-500 text-charcoal-900 shadow-sm font-bold'
                      : 'text-cream-300 hover:bg-charcoal-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-charcoal-900' : 'text-cream-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Diner Site & Logout */}
        <div className="pt-6 border-t border-charcoal-800 space-y-2 text-xs font-bold">
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

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

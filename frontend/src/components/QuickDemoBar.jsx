import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UtensilsCrossed, UserCheck, LogOut, Sparkles, Palette } from 'lucide-react';

const QuickDemoBar = () => {
  const { user, demoLogin, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const navigate = useNavigate();

  const handleDemo = async (type, redirectPath) => {
    try {
      await demoLogin(type);
      navigate(redirectPath);
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-cream-300 text-xs py-2 px-4 sticky top-0 z-50 shadow-sm text-black">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Role Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-black mr-1">
            <Sparkles className="w-3.5 h-3.5 text-burgundy-700" />
            <span className="hidden sm:inline font-bold text-black">Role:</span>
          </div>

          <button
            onClick={() => handleDemo('customer', '/')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              user?.role === 'customer'
                ? 'bg-burgundy-600 text-white shadow-sm ring-2 ring-burgundy-400'
                : 'bg-white hover:bg-cream-100 text-black border border-cream-300 shadow-xs'
            }`}
          >
            <UserCheck className={`w-3.5 h-3.5 ${user?.role === 'customer' ? 'text-white' : 'text-burgundy-700'}`} />
            <span className={`font-bold ${user?.role === 'customer' ? 'text-white' : 'text-black'}`}>Customer</span>
          </button>

          <button
            onClick={() => handleDemo('restaurant', '/restaurant-portal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              user?.role === 'restaurant_owner'
                ? 'bg-burgundy-600 text-white shadow-sm ring-2 ring-burgundy-400'
                : 'bg-white hover:bg-cream-100 text-black border border-cream-300 shadow-xs'
            }`}
          >
            <UtensilsCrossed className={`w-3.5 h-3.5 ${user?.role === 'restaurant_owner' ? 'text-white' : 'text-burgundy-700'}`} />
            <span className={`font-bold ${user?.role === 'restaurant_owner' ? 'text-white' : 'text-black'}`}>Restaurant</span>
          </button>

          <button
            onClick={() => handleDemo('admin', '/admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              user?.role === 'admin'
                ? 'bg-burgundy-600 text-white shadow-sm ring-2 ring-burgundy-400'
                : 'bg-white hover:bg-cream-100 text-black border border-cream-300 shadow-xs'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${user?.role === 'admin' ? 'text-white' : 'text-burgundy-700'}`} />
            <span className={`font-bold ${user?.role === 'admin' ? 'text-white' : 'text-black'}`}>Admin</span>
          </button>
        </div>

        {/* Background / Palette Switcher */}
        <div className="flex items-center gap-1.5 bg-cream-50 px-2.5 py-1 rounded-xl border border-cream-300">
          <Palette className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
          <span className="text-black font-bold text-[11px] hidden md:inline mr-1">Background:</span>
          
          <div className="flex items-center gap-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={`${t.name}: ${t.description}`}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  theme === t.id
                    ? 'bg-burgundy-600 text-white shadow-sm ring-2 ring-burgundy-400 scale-105'
                    : 'bg-white text-black hover:bg-cream-100 border border-cream-300 shadow-xs'
                }`}
              >
                <span>{t.icon}</span>
                <span className={`hidden sm:inline font-bold ${theme === t.id ? 'text-white' : 'text-black'}`}>{t.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User state & Logout */}
        <div className="flex items-center gap-2 text-black">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[150px] text-xs hidden lg:inline text-black font-bold">
                Active: <strong className="text-burgundy-700 font-bold">{user.name}</strong>
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1 bg-white hover:bg-red-50 px-2 py-0.5 rounded border border-red-300 text-xs shadow-xs"
                title="Log out"
              >
                <LogOut className="w-3 h-3 text-red-700" />
                <span className="text-red-700 font-bold">Logout</span>
              </button>
            </div>
          ) : (
            <span className="text-black font-bold text-xs hidden sm:inline">Guest Visitor</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickDemoBar;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  UtensilsCrossed,
  Shield,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  ChevronDown,
  Palette,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes, activeThemeMeta } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-cream-200 sticky top-10 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-charcoal-900 border border-gold-500/40 flex items-center justify-center p-0.5 shadow-md">
              <UtensilsCrossed className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-charcoal-900">
                Dine<span className="text-burgundy-600">Easy</span>
              </span>
              <span className="block text-[10px] tracking-wider uppercase text-charcoal-900 font-sans -mt-1 font-bold">
                Table Reservations & Menus
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Home, Restaurants, My Bookings, About, Contact, Login */}
          <div className="hidden md:flex items-center space-x-7">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 ${
                isActive('/') ? 'text-burgundy-600 border-burgundy-600' : 'text-charcoal-700 border-transparent hover:text-charcoal-900'
              }`}
            >
              Home
            </Link>

            <Link
              to="/restaurants"
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 ${
                isActive('/restaurants') ? 'text-burgundy-600 border-burgundy-600' : 'text-charcoal-700 border-transparent hover:text-charcoal-900'
              }`}
            >
              Restaurants
            </Link>

            {user?.role === 'customer' && (
              <Link
                to="/my-bookings"
                className={`text-sm font-semibold flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
                  isActive('/my-bookings') ? 'text-burgundy-600 border-burgundy-600' : 'text-charcoal-700 border-transparent hover:text-charcoal-900'
                }`}
              >
                <Calendar className="w-4 h-4 text-burgundy-600" />
                My Bookings
              </Link>
            )}

            <Link
              to="/about"
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 ${
                isActive('/about') ? 'text-burgundy-600 border-burgundy-600' : 'text-charcoal-700 border-transparent hover:text-charcoal-900'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 ${
                isActive('/contact') ? 'text-burgundy-600 border-burgundy-600' : 'text-charcoal-700 border-transparent hover:text-charcoal-900'
              }`}
            >
              Contact
            </Link>

            {/* Direct Portal Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-bold text-charcoal-800 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-burgundy-600" />
                <span>Portals</span>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" />
              </button>

              {portalDropdownOpen && (
                <div
                  onMouseLeave={() => setPortalDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-cream-300 shadow-xl py-2 z-50 text-xs animate-in fade-in"
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 border-b border-cream-200">
                    Switch Active Portal
                  </div>
                  <Link
                    to="/"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <Compass className="w-4 h-4 text-gold-600" />
                    <div>
                      <div className="font-bold">Customer Website</div>
                      <div className="text-[10px] text-charcoal-500">Discover and book tables</div>
                    </div>
                  </Link>

                  <Link
                    to="/restaurant-portal"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-burgundy-600" />
                    <div>
                      <div className="font-bold">Restaurant Dashboard</div>
                      <div className="text-[10px] text-charcoal-500">Manage bookings & menu</div>
                    </div>
                  </Link>

                  <Link
                    to="/admin"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Super Admin Panel</div>
                      <div className="text-[10px] text-charcoal-500">Manage platform records</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Background Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-bold text-charcoal-800 transition-colors"
                title="Change background color theme"
              >
                <span>{activeThemeMeta.icon}</span>
                <span className="hidden lg:inline">{activeThemeMeta.shortName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" />
              </button>

              {themeDropdownOpen && (
                <div
                  onMouseLeave={() => setThemeDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-cream-300 shadow-xl py-2 z-50 text-xs animate-in fade-in"
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 border-b border-cream-200 flex items-center justify-between">
                    <span>Background Color</span>
                    <Palette className="w-3.5 h-3.5 text-gold-600" />
                  </div>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-cream-100 transition-colors ${
                        theme === t.id ? 'font-bold text-burgundy-600 bg-cream-50' : 'text-charcoal-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <div>
                          <div className="font-semibold text-xs text-charcoal-900">{t.name}</div>
                          <div className="text-[10px] text-charcoal-500 leading-none mt-0.5">{t.tone === 'dark' ? 'Vibrant Rich' : 'Luminous Bright'}</div>
                        </div>
                      </div>
                      <span
                        className="w-4 h-4 rounded-full border border-charcoal-300 shadow-xs shrink-0"
                        style={{ backgroundColor: t.bgColor }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 border border-cream-300 hover:border-gold-500 text-xs font-semibold text-charcoal-800"
                >
                  <User className="w-3.5 h-3.5 text-gold-600" />
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 text-charcoal-500 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-charcoal-800 hover:text-burgundy-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-charcoal-800 p-2 rounded-lg bg-cream-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-cream-200 px-5 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-charcoal-900 font-bold py-1.5 border-b border-cream-100"
          >
            Home
          </Link>
          <Link
            to="/restaurants"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-charcoal-900 font-bold py-1.5 border-b border-cream-100"
          >
            Restaurants
          </Link>
          <Link
            to="/my-bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-charcoal-900 font-bold py-1.5 border-b border-cream-100"
          >
            My Bookings
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-charcoal-900 font-bold py-1.5 border-b border-cream-100"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-charcoal-900 font-bold py-1.5 border-b border-cream-100"
          >
            Contact
          </Link>

          <div className="pt-2">
            <div className="text-[10px] uppercase font-bold text-charcoal-400 mb-1">Interfaces</div>
            <Link
              to="/restaurant-portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-burgundy-600 py-1"
            >
              🍽️ Restaurant Dashboard
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-emerald-700 py-1"
            >
              🛡️ Super Admin Panel
            </Link>
          </div>

          <div className="pt-2">
            <div className="text-[10px] uppercase font-bold text-charcoal-400 mb-1.5">Background Theme</div>
            <div className="grid grid-cols-2 gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border text-left ${
                    theme === t.id
                      ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-sm'
                      : 'bg-white text-charcoal-800 border-cream-300'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="truncate">{t.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-cream-200">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-800">Hello, {user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-xs font-bold rounded-xl bg-cream-100 text-charcoal-800 border border-cream-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-xs font-bold rounded-xl bg-burgundy-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

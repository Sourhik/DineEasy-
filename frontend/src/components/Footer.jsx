import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Shield, Clock, Phone, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/90 backdrop-blur-md border-t border-burgundy-200/80 pt-16 pb-12 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-burgundy-50 border border-burgundy-200 flex items-center justify-center p-0.5 shadow-sm">
                <UtensilsCrossed className="w-5 h-5 text-burgundy-700" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-black">
                Dine<span className="text-burgundy-700">Easy</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-900 font-medium leading-relaxed">
              The straightforward multi-restaurant reservation platform. Reserve fine tables, explore published menus, and pre-order your courses with zero friction.
            </p>
          </div>

          {/* Col 2: Customer Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-black tracking-wide border-b border-burgundy-200 pb-2">
              Customer Website
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-black hover:text-burgundy-700 font-medium transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="text-black hover:text-burgundy-700 font-medium transition-colors">
                  Restaurants Directory
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-black hover:text-burgundy-700 font-medium transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-black hover:text-burgundy-700 font-medium transition-colors">
                  About DineEasy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-black hover:text-burgundy-700 font-medium transition-colors">
                  Contact Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-black tracking-wide border-b border-burgundy-200 pb-2">
              Management Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/restaurant-portal" className="text-black hover:text-burgundy-700 font-medium transition-colors flex items-center gap-2">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                  <span>Restaurant Owner Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-black hover:text-burgundy-700 font-medium transition-colors flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                  <span>Super Admin Control Panel</span>
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-charcoal-800 font-medium block pt-1 leading-relaxed">
                  All 3 interfaces synchronize live with MongoDB and Socket.IO.
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Concierge */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-base font-bold text-black tracking-wide border-b border-burgundy-200 pb-2">
              Support & Inquiries
            </h4>
            <div className="space-y-2 text-black">
              <div className="flex items-center gap-2 font-medium">
                <Phone className="w-4 h-4 text-burgundy-700 shrink-0" />
                <span>+1 (800) 555-DINE</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Mail className="w-4 h-4 text-burgundy-700 shrink-0" />
                <span>concierge@dineeasy.com</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-burgundy-700 shrink-0" />
                <span>24/7 Table Booking & Live Sync</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-burgundy-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-black font-medium gap-4">
          <p>© {new Date().getFullYear()} DineEasy Multi-Restaurant System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-burgundy-600 fill-burgundy-600" /> for simple and reliable dining.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

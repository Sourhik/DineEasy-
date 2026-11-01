import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Shield, Clock, Award, Users, Heart, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-theme-page min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-charcoal-900">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-white px-3.5 py-1.5 rounded-full border border-cream-300 shadow-sm inline-block">
            About DineEasy
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight theme-canvas-title">
            Simplifying Dining Reservations For Everyone
          </h1>
          <p className="text-base sm:text-lg theme-canvas-sub max-w-2xl mx-auto leading-relaxed">
            DineEasy bridges the gap between discerning food lovers and premier restaurants through effortless bookings, live availability, and advance food course ordering.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">Our Mission</h2>
          </div>

          <p className="text-charcoal-700 leading-relaxed text-sm sm:text-base">
            We believe dining out should be an enjoyable experience from the moment you decide where to eat. No more calling busy restaurants, waiting indefinitely for confirmations, or sitting with an empty table waiting for food preparation.
          </p>

          <p className="text-charcoal-700 leading-relaxed text-sm sm:text-base">
            With DineEasy, every diner can discover verified restaurants, check real-time table availability, optionally choose signature courses from published menus, and receive instant booking confirmation.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-cream-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-burgundy-50 border border-burgundy-200 flex items-center justify-center text-burgundy-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Zero Wait Times</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Bookings and table capacities are verified in real time to avoid double bookings and prolonged waits.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-cream-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Advance Menus</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Optionally pre-order food dishes from the kitchen's published menu so courses are served fresh upon seating.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-cream-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Verified Quality</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Every dining establishment on DineEasy is reviewed and verified by platform administrators.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-charcoal-900 rounded-3xl p-8 sm:p-10 text-center space-y-4 text-cream-100 shadow-md">
          <h3 className="font-serif text-2xl font-bold text-white">Experience Seamless Dining Today</h3>
          <p className="text-xs sm:text-sm text-cream-300 max-w-lg mx-auto">
            Explore our curated culinary partners and reserve your table in just a few clicks.
          </p>
          <div className="pt-2">
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold text-sm shadow-md transition-colors"
            >
              <span>Explore Restaurants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;


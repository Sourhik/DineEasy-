import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Lock, Mail, Phone, User, ArrowRight, AlertCircle, Building2, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'restaurant_owner'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const newUser = await register({
        name,
        email,
        phone,
        password,
        role,
      });

      if (newUser.role === 'restaurant_owner') {
        navigate('/restaurant-portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-theme-page flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-charcoal-900">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 border border-gold-500/40 p-2.5 mx-auto flex items-center justify-center text-gold-400 shadow-md">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold theme-canvas-title">
            Create an Account
          </h2>
          <p className="text-xs theme-canvas-sub">
            Join DineEasy as a dining customer or register your restaurant.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 shadow-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          {/* Role selector pill */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-cream-100 rounded-2xl border border-cream-300 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                role === 'customer'
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Diner / Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('restaurant_owner')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                role === 'restaurant_owner'
                  ? 'bg-burgundy-600 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Restaurant Owner</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-800">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'customer' ? 'e.g. John Doe' : 'e.g. Marco Rossi'}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-800">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-800">Phone Number (Supports OTP Login)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-800">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </button>
        </form>

        <p className="text-center text-xs text-charcoal-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-burgundy-700 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

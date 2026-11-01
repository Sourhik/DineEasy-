import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Lock, Mail, ArrowRight, AlertCircle, Phone, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login, requestPhoneOtp, verifyPhoneOtp, demoLogin } = useAuth();
  const navigate = useNavigate();

  // Mode: 'email' | 'phone'
  const [authMode, setAuthMode] = useState('email');

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNotice, setOtpNotice] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (loggedUser) => {
    if (loggedUser.role === 'admin') {
      navigate('/admin');
    } else if (loggedUser.role === 'restaurant_owner') {
      navigate('/restaurant-portal');
    } else {
      navigate('/');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(email, password);
      redirectByRole(loggedUser);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter your registered phone number');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await requestPhoneOtp(phoneNumber.trim());
      setOtpSent(true);
      setOtpNotice(`OTP sent successfully! Demo verification code: ${res.demoOtp || '123456'}`);
    } catch (err) {
      setError(err.message || 'Error sending verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const loggedUser = await verifyPhoneOtp(phoneNumber.trim(), otpCode.trim());
      redirectByRole(loggedUser);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (type) => {
    try {
      setLoading(true);
      setError('');
      const loggedUser = await demoLogin(type);
      redirectByRole(loggedUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-theme-page flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-charcoal-900">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 border border-gold-500/40 p-2.5 mx-auto flex items-center justify-center text-gold-400 shadow-md">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold theme-canvas-title">
            Sign In to DineEasy
          </h2>
          <p className="text-xs theme-canvas-sub">
            Access your dining reservations, restaurant management, or admin portal.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 shadow-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {otpNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 shadow-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{otpNotice}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Method selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-cream-100 rounded-2xl border border-cream-300 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError('');
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'email'
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('phone');
                setError('');
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'phone'
                  ? 'bg-burgundy-600 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone & OTP</span>
            </button>
          </div>

          {/* Email Login Form */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-charcoal-800">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-burgundy-700 hover:underline font-semibold">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
              >
                <span>{loading ? 'Signing In...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </form>
          )}

          {/* Phone OTP Login Form */}
          {authMode === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-charcoal-800">Registered Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 555-0311 or +1 555-0101"
                        className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-charcoal-500">For owners & diners</span>
                      <button
                        type="button"
                        onClick={() => setPhoneNumber('+1 555-0311')}
                        className="text-burgundy-700 hover:underline font-bold"
                      >
                        Auto-fill Owner Phone
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-cream-50 border border-cream-300 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-charcoal-500 uppercase font-bold">Verifying Number</span>
                      <div className="font-bold text-charcoal-900">{phoneNumber}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                      className="text-burgundy-700 font-bold hover:underline text-[11px]"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-charcoal-800">Enter 6-Digit OTP</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength="6"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-center text-base tracking-widest font-mono font-bold text-charcoal-900 focus:outline-none focus:border-gold-500 focus:bg-white"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setOtpCode('123456')}
                        className="text-[11px] text-emerald-700 hover:underline font-bold"
                      >
                        Auto-fill Test Code (123456)
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 1-Click Fast Demo Credentials */}
          <div className="pt-4 border-t border-cream-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block text-center">
              Quick 1-Click Test Personas
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="py-2 px-2 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-[11px] font-bold text-charcoal-800 transition-all text-center"
              >
                Diner
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('owner')}
                className="py-2 px-2 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-[11px] font-bold text-burgundy-800 transition-all text-center"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-2 px-2 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-[11px] font-bold text-charcoal-900 transition-all text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer sign up prompt */}
        <p className="text-center text-xs text-charcoal-600">
          New to DineEasy?{' '}
          <Link to="/register" className="font-bold text-burgundy-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

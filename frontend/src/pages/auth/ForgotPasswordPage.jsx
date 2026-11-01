import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/forgot-password', { email, newPassword });
      if (res.data.success) {
        setMessage(res.data.message);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-theme-page flex items-center justify-center py-12 px-4 text-charcoal-900">
      <div className="max-w-md w-full space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs theme-canvas-sub hover:theme-canvas-title font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 border border-gold-500/40 p-2.5 mx-auto flex items-center justify-center text-gold-400 shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold theme-canvas-title">Reset Your Password</h2>
          <p className="text-xs theme-canvas-sub">
            Enter your registered account email to update your access credentials.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 shadow-sm font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && step !== 3 && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 shadow-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-800">Registered Email Address</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying account...' : 'Verify Email & Continue'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-300 text-xs">
                <span className="text-[10px] text-charcoal-500 uppercase font-bold">Account</span>
                <div className="font-bold text-charcoal-900">{email}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-800">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Saving new password...' : 'Update Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Password Changed!</h3>
              <p className="text-xs text-charcoal-600">
                Your credentials have been securely updated. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-xl bg-charcoal-900 text-white font-bold text-xs hover:bg-charcoal-800 shadow-sm"
              >
                Proceed to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

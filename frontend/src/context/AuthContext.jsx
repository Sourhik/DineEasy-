import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('dineeasy_token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('dineeasy_token');
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('dineeasy_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const requestPhoneOtp = async (phone) => {
    const res = await api.post('/auth/phone-otp-request', { phone });
    return res.data;
  };

  const verifyPhoneOtp = async (phone, otp, role = 'restaurant_owner', name = '') => {
    const res = await api.post('/auth/phone-otp-verify', { phone, otp, role, name });
    if (res.data.success) {
      localStorage.setItem('dineeasy_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Verification failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('dineeasy_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('dineeasy_token');
    setUser(null);
  };

  // Quick helper to log in demo accounts for testing
  const demoLogin = async (type) => {
    if (type === 'customer') {
      return await login('john@example.com', 'customer123');
    } else if (type === 'restaurant') {
      return await login('saffron@dineeasy.com', 'saffron123');
    } else if (type === 'admin') {
      return await login('admin@dineeasy.com', 'admin123');
    }
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, ...res.data.user }));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        requestPhoneOtp,
        verifyPhoneOtp,
        register,
        logout,
        demoLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


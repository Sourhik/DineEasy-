import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import QuickDemoBar from './components/QuickDemoBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import RestaurantsPage from './pages/customer/RestaurantsPage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import BookingWizardPage from './pages/customer/BookingWizardPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Restaurant Pages
import RestaurantLayout from './pages/restaurant/RestaurantLayout';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantMenu from './pages/restaurant/RestaurantMenu';
import RestaurantReservations from './pages/restaurant/RestaurantReservations';
import RestaurantProfile from './pages/restaurant/RestaurantProfile';
import RestaurantNotifications from './pages/restaurant/RestaurantNotifications';
import RestaurantSettings from './pages/restaurant/RestaurantSettings';
import RestaurantTables from './pages/restaurant/RestaurantTables';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminReservations from './pages/admin/AdminReservations';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminSettings from './pages/admin/AdminSettings';

// Protected Route wrappers
const ProtectedRestaurantRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-charcoal-700 font-bold">Verifying session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'restaurant_owner' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-charcoal-700 font-bold">Verifying session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Customer Layout Wrapper (Navbar + Content + Footer)
const CustomerLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-theme-page">
    <Navbar />
    <div className="flex-1">{children}</div>
    <Footer />
  </div>
);

const AppContent = () => {
  const { user } = useAuth();

  return (
    <SocketProvider user={user}>
      <BrowserRouter>
        {/* Sleek demo switcher bar for testing all 3 interfaces effortlessly */}
        <QuickDemoBar />

        {/* Global real-time toast alert */}
        <NotificationToast />

        <Routes>
          {/* Customer & Public Routes */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            }
          />
          <Route
            path="/restaurants"
            element={
              <CustomerLayout>
                <RestaurantsPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/restaurant/:id"
            element={
              <CustomerLayout>
                <RestaurantDetailPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/book"
            element={
              <CustomerLayout>
                <BookingWizardPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/book/:id"
            element={
              <CustomerLayout>
                <BookingWizardPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <CustomerLayout>
                <MyBookingsPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <CustomerLayout>
                <CustomerProfilePage />
              </CustomerLayout>
            }
          />
          <Route
            path="/about"
            element={
              <CustomerLayout>
                <AboutPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <CustomerLayout>
                <ContactPage />
              </CustomerLayout>
            }
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <CustomerLayout>
                <LoginPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/register"
            element={
              <CustomerLayout>
                <RegisterPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <CustomerLayout>
                <ForgotPasswordPage />
              </CustomerLayout>
            }
          />

          {/* Restaurant Dashboard Portal */}
          <Route
            path="/restaurant-portal"
            element={
              <ProtectedRestaurantRoute>
                <RestaurantLayout />
              </ProtectedRestaurantRoute>
            }
          >
            <Route index element={<RestaurantDashboard />} />
            <Route path="reservations" element={<RestaurantReservations />} />
            <Route path="menu" element={<RestaurantMenu />} />
            <Route path="profile" element={<RestaurantProfile />} />
            <Route path="notifications" element={<RestaurantNotifications />} />
            <Route path="settings" element={<RestaurantSettings />} />
            <Route path="tables" element={<RestaurantTables />} />
          </Route>

          {/* Super Admin Control Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  User,
  Plus,
  Minus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Printer,
  Copy,
} from 'lucide-react';

const BookingWizardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // All restaurants for Step 1
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Wizard state: 1 to 6
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  // Step 2: Customer Details
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 3: Reservation Details
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [bookingTime, setBookingTime] = useState('07:30 PM');
  const [guestsCount, setGuestsCount] = useState(2);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);

  // Step 4: Menu Preference
  const [menuPreference, setMenuPreference] = useState(null); // 'YES' | 'NO'

  // Step 5: Menu items for selected restaurant
  const [menuItems, setMenuItems] = useState([]);
  const [activeMenuCategory, setActiveMenuCategory] = useState('All');
  const [selectedDishes, setSelectedDishes] = useState({}); // { [itemId]: { dish, quantity } }
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Final confirmation result
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const timeSlots = [
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
    '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM'
  ];

  // Prefill details if user changes
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (!customerPhone) setCustomerPhone(user.phone || '');
    }
  }, [user]);

  // Load restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/restaurants');
        if (res.data.success) {
          setAllRestaurants(res.data.restaurants);
          if (id) {
            const match = res.data.restaurants.find((r) => r._id === id);
            if (match) {
              setSelectedRestaurant(match);
              // If restaurant already selected via URL, jump directly to Step 2
              setCurrentStep(2);
            }
          } else if (res.data.restaurants.length > 0) {
            setSelectedRestaurant(res.data.restaurants[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    };
    fetchRestaurants();
  }, [id]);

  // Load restaurant's menu when selected
  useEffect(() => {
    if (selectedRestaurant) {
      const fetchMenu = async () => {
        try {
          setLoadingMenu(true);
          const res = await api.get(`/restaurants/${selectedRestaurant._id}/menu`);
          if (res.data.success) {
            setMenuItems(res.data.menuItems);
          }
        } catch (err) {
          console.error('Error loading menu:', err);
        } finally {
          setLoadingMenu(false);
        }
      };
      fetchMenu();
    }
  }, [selectedRestaurant]);

  // Check Table Availability
  const handleCheckAvailability = async () => {
    if (!selectedRestaurant) return;
    try {
      setCheckingAvailability(true);
      setErrorMessage('');
      const res = await api.post('/reservations/check-availability', {
        restaurantId: selectedRestaurant._id,
        date: bookingDate,
        timeSlot: bookingTime,
        guestsCount,
      });

      if (res.data.success) {
        setAvailabilityResult(res.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Dish quantity handlers
  const handleAddDish = (dish) => {
    setSelectedDishes((prev) => {
      const current = prev[dish._id]?.quantity || 0;
      return {
        ...prev,
        [dish._id]: {
          dish,
          quantity: current + 1,
        },
      };
    });
  };

  const handleRemoveDish = (dishId) => {
    setSelectedDishes((prev) => {
      const current = prev[dishId]?.quantity || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[dishId];
        return copy;
      }
      return {
        ...prev,
        [dishId]: {
          ...prev[dishId],
          quantity: current - 1,
        },
      };
    });
  };

  const handleDeleteDish = (dishId) => {
    setSelectedDishes((prev) => {
      const copy = { ...prev };
      delete copy[dishId];
      return copy;
    });
  };

  const estimatedFoodTotal = Object.values(selectedDishes).reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const selectedDishesArray = Object.values(selectedDishes);

  const canProceedFromStep2 = customerName.trim() && customerEmail.trim() && customerPhone.trim();
  const canProceedFromStep3 = bookingDate && bookingTime && guestsCount > 0;

  const handleNextStep = async () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!selectedRestaurant) {
        setErrorMessage('Please select a restaurant to proceed.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!canProceedFromStep2) {
        setErrorMessage('Please provide your name, email, and contact phone number.');
        return;
      }
      setCurrentStep(3);
      handleCheckAvailability();
    } else if (currentStep === 3) {
      if (!canProceedFromStep3) {
        setErrorMessage('Please choose date, time, and guest count.');
        return;
      }
      if (!availabilityResult) {
        await handleCheckAvailability();
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!menuPreference) {
        setErrorMessage('Please indicate whether you want to choose your menu now or at the restaurant.');
        return;
      }
      if (menuPreference === 'YES') {
        setCurrentStep(5);
      } else {
        setCurrentStep(6);
      }
    } else if (currentStep === 5) {
      setCurrentStep(6);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    if (currentStep === 6 && menuPreference === 'NO') {
      setCurrentStep(4);
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleConfirmReservation = async () => {
    try {
      setSubmitting(true);
      setErrorMessage('');

      const formattedItems = selectedDishesArray.map(({ dish, quantity }) => ({
        menuItemId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity,
        category: dish.category,
        image: dish.image,
      }));

      const payload = {
        restaurantId: selectedRestaurant._id,
        customerName,
        customerEmail,
        customerPhone,
        date: bookingDate,
        timeSlot: bookingTime,
        guestsCount: parseInt(guestsCount, 10),
        menuPreference,
        selectedItems: menuPreference === 'YES' ? formattedItems : [],
        specialRequests,
      };

      const res = await api.post('/reservations', payload);
      if (res.data.success) {
        setConfirmedReservation(res.data.reservation);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const copyBookingId = () => {
    if (confirmedReservation?.bookingId) {
      navigator.clipboard.writeText(confirmedReservation.bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Step 6 / Confirmation Page
  if (confirmedReservation) {
    return (
      <div className="min-h-screen bg-theme-page py-16 px-4 sm:px-6 lg:px-8 text-charcoal-900">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl border border-cream-300 p-8 sm:p-10 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
                Reservation Successful
              </span>
              <h2 className="font-serif text-3xl font-bold text-charcoal-900">
                Table Booking Confirmed!
              </h2>
              <p className="text-xs text-charcoal-600">
                Details have been delivered to {selectedRestaurant?.name}. We look forward to hosting you!
              </p>
            </div>

            {/* Unique Booking ID card */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-charcoal-500">Your Booking ID</div>
                <div className="font-mono text-2xl font-bold text-burgundy-600">{confirmedReservation.bookingId}</div>
              </div>
              <button
                onClick={copyBookingId}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-cream-100 text-xs font-bold text-charcoal-800 border border-cream-300 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Summary Details */}
            <div className="grid grid-cols-2 gap-4 text-left text-xs bg-cream-50 p-5 rounded-2xl border border-cream-300">
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Restaurant</span>
                <span className="text-charcoal-900 font-bold text-sm">{selectedRestaurant?.name}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Seating Status</span>
                <span className="text-emerald-700 font-bold text-sm">{confirmedReservation.tableNumber}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Date & Time</span>
                <span className="text-charcoal-800 font-semibold">{confirmedReservation.date} at {confirmedReservation.timeSlot}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Party Size</span>
                <span className="text-charcoal-800 font-semibold">{confirmedReservation.guestsCount} Guest(s)</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Diner Name</span>
                <span className="text-charcoal-800 font-semibold">{confirmedReservation.customerName}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[10px] uppercase font-bold">Phone Contact</span>
                <span className="text-charcoal-800 font-semibold">{confirmedReservation.customerPhone}</span>
              </div>
            </div>

            {/* Pre-ordered Food */}
            {confirmedReservation.menuPreference === 'YES' && confirmedReservation.selectedItems?.length > 0 && (
              <div className="text-left bg-cream-50 p-5 rounded-2xl border border-cream-300 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-900 border-b border-cream-300 pb-2">
                  <span>Pre-Ordered Menu Items</span>
                  <span className="text-burgundy-600">Est. Total: ${confirmedReservation.estimatedFoodTotal?.toFixed(2)}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {confirmedReservation.selectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-charcoal-700">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-mono font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/my-bookings"
                className="flex-1 py-3.5 px-4 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs text-center shadow-md transition-all"
              >
                Go to My Bookings
              </Link>
              <button
                onClick={() => window.print()}
                className="py-3.5 px-4 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-cream-300 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Booking Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuCategories = ['All', 'Starters', 'Main Course', 'Desserts', 'Drinks', 'Chef Specials'];

  const displayedDishes =
    activeMenuCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => i.category === activeMenuCategory);

  return (
    <div className="min-h-screen bg-theme-page text-charcoal-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600 bg-white px-3 py-1 rounded-full border border-cream-300 shadow-sm">
                Step {currentStep} of 6
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold theme-canvas-title mt-2">
                {currentStep === 1 && 'Step 1: Choose Your Restaurant'}
                {currentStep === 2 && 'Step 2: Enter Guest Details'}
                {currentStep === 3 && 'Step 3: Select Date, Time & Table Check'}
                {currentStep === 4 && 'Step 4: Food Menu Preference'}
                {currentStep === 5 && 'Step 5: Select Your Food Dishes (Optional)'}
                {currentStep === 6 && 'Step 6: Review & Confirm Reservation'}
              </h1>
            </div>

            {selectedRestaurant && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-cream-300 shadow-sm">
                <img
                  src={selectedRestaurant.logo}
                  alt=""
                  className="w-7 h-7 rounded-xl object-cover border border-cream-300"
                />
                <span className="text-xs font-bold text-charcoal-800 truncate max-w-[160px]">
                  {selectedRestaurant.name}
                </span>
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-6 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  num < currentStep
                    ? 'bg-emerald-600'
                    : num === currentStep
                    ? 'bg-burgundy-600 shadow-sm'
                    : 'bg-cream-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: SELECT RESTAURANT ================= */}
        {currentStep === 1 && (
          <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <p className="text-xs text-charcoal-600">
              Please click to select the restaurant where you would like to book a dining table:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allRestaurants.map((r) => (
                <div
                  key={r._id}
                  onClick={() => setSelectedRestaurant(r)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex gap-3.5 items-center ${
                    selectedRestaurant?._id === r._id
                      ? 'bg-cream-50 border-burgundy-600 shadow-md ring-2 ring-burgundy-600/20'
                      : 'bg-white border-cream-300 hover:border-gold-500'
                  }`}
                >
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-charcoal-900 truncate">{r.name}</h4>
                    <p className="text-[11px] text-charcoal-500 truncate">{r.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gold-600 font-bold">★ {r.rating}</span>
                      <span className="text-[11px] text-charcoal-400">• {r.cuisine?.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 2: CUSTOMER DETAILS ================= */}
        {currentStep === 2 && (
          <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <span className="text-xs text-charcoal-600">
                Confirm your guest contact information for booking confirmations and notifications.
              </span>
              {user && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Pre-filled
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-charcoal-800">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gold-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-charcoal-800">Contact Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gold-600 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +1 555-0211"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-charcoal-800">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gold-600 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-charcoal-800">Special Seating Requests (Optional)</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g., High chair needed, anniversary dinner, quiet window table..."
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: RESERVATION DETAILS ================= */}
        {currentStep === 3 && (
          <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-burgundy-600" />
                  Choose Booking Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setAvailabilityResult(null);
                  }}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 font-semibold focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Guest Count */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-burgundy-600" />
                  Number of Guests
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGuestsCount((prev) => Math.max(1, prev - 1));
                      setAvailabilityResult(null);
                    }}
                    className="w-11 h-11 rounded-xl bg-cream-100 border border-cream-300 hover:bg-cream-200 flex items-center justify-center text-charcoal-900 font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center font-bold text-base text-charcoal-900 bg-cream-50 py-2.5 rounded-xl border border-cream-300">
                    {guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGuestsCount((prev) => Math.min(20, prev + 1));
                      setAvailabilityResult(null);
                    }}
                    className="w-11 h-11 rounded-xl bg-cream-100 border border-cream-300 hover:bg-cream-200 flex items-center justify-center text-charcoal-900 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Time Slot Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-burgundy-600" />
                Select Preferred Time Slot
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setBookingTime(slot);
                      setAvailabilityResult(null);
                    }}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all border ${
                      bookingTime === slot
                        ? 'bg-burgundy-600 text-white border-burgundy-600 shadow-sm'
                        : 'bg-cream-50 text-charcoal-800 border-cream-300 hover:border-gold-500'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Check status */}
            <div className="pt-4 border-t border-cream-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checkingAvailability}
                  className="px-5 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-900 font-bold text-xs border border-cream-300 flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-gold-600" />
                  <span>{checkingAvailability ? 'Checking live capacity...' : 'Check Table Availability'}</span>
                </button>

                {availabilityResult && (
                  <div
                    className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 ${
                      availabilityResult.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-red-50 text-red-800 border border-red-300'
                    }`}
                  >
                    {availabilityResult.isAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{availabilityResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: MENU SELECTION PREFERENCE ================= */}
        {currentStep === 4 && (
          <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-200 text-gold-600 flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                "Would you like to select your food menu before arriving?"
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Pre-ordering dishes gives the kitchen advance notice so your food is served hot shortly after seating.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto pt-4 text-left">
              {/* Option 1: YES */}
              <div
                onClick={() => setMenuPreference('YES')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  menuPreference === 'YES'
                    ? 'bg-cream-50 border-burgundy-600 shadow-md ring-2 ring-burgundy-600/20'
                    : 'bg-white border-cream-300 hover:border-gold-500'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-burgundy-600">Option 1</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        menuPreference === 'YES'
                          ? 'border-burgundy-600 bg-burgundy-600 text-white'
                          : 'border-cream-300'
                      }`}
                    >
                      {menuPreference === 'YES' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-charcoal-900">
                    Yes, I want to choose my menu
                  </h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Browse {selectedRestaurant?.name}'s live published menu and pre-order dishes now.
                  </p>
                </div>
                <span className="text-xs text-burgundy-600 font-bold">Choose Food Courses →</span>
              </div>

              {/* Option 2: NO */}
              <div
                onClick={() => setMenuPreference('NO')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  menuPreference === 'NO'
                    ? 'bg-cream-50 border-burgundy-600 shadow-md ring-2 ring-burgundy-600/20'
                    : 'bg-white border-cream-300 hover:border-gold-500'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">Option 2</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        menuPreference === 'NO'
                          ? 'border-burgundy-600 bg-burgundy-600 text-white'
                          : 'border-cream-300'
                      }`}
                    >
                      {menuPreference === 'NO' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-charcoal-900">
                    No, I will choose my food at the restaurant
                  </h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Skip menu pre-ordering and order directly from the physical menu when you arrive.
                  </p>
                </div>
                <span className="text-xs text-charcoal-700 font-bold">Skip directly to Table Confirmation →</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: MENU PRE-ORDERING (if YES) ================= */}
        {currentStep === 5 && menuPreference === 'YES' && (
          <div className="space-y-6">
            <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Category selector */}
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-cream-200 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">
                    {selectedRestaurant?.name}'s Menu
                  </h3>
                  <p className="text-xs text-charcoal-600">
                    Click "Add" on any dishes you would like to pre-order for your table.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {menuCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActiveMenuCategory(c)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeMenuCategory === c
                          ? 'bg-charcoal-900 text-white'
                          : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dishes list */}
              {loadingMenu ? (
                <div className="text-center py-12 text-gold-600 font-bold">Loading dishes...</div>
              ) : displayedDishes.length === 0 ? (
                <div className="text-center py-12 text-charcoal-500 text-xs">No items in this category.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedDishes.map((dish) => {
                    const selectedQty = selectedDishes[dish._id]?.quantity || 0;
                    return (
                      <div
                        key={dish._id}
                        className={`p-4 rounded-2xl border transition-all flex gap-3.5 items-center justify-between ${
                          selectedQty > 0
                            ? 'bg-cream-50 border-burgundy-600 shadow-sm'
                            : 'bg-white border-cream-300'
                        }`}
                      >
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="font-serif text-sm font-bold text-charcoal-900 truncate">{dish.name}</h4>
                          <p className="text-[11px] text-charcoal-500 line-clamp-1">{dish.description}</p>
                          <span className="text-xs font-bold text-burgundy-600">${dish.price.toFixed(2)}</span>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {selectedQty > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRemoveDish(dish._id)}
                                className="w-7 h-7 rounded-lg bg-cream-200 hover:bg-cream-300 flex items-center justify-center text-charcoal-800 font-bold"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-xs text-charcoal-900 w-5 text-center">
                                {selectedQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddDish(dish)}
                                className="w-7 h-7 rounded-lg bg-cream-200 hover:bg-cream-300 flex items-center justify-center text-charcoal-800 font-bold"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddDish(dish)}
                              className="px-3 py-1.5 rounded-lg bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected food summary tray */}
            {selectedDishesArray.length > 0 && (
              <div className="bg-white border border-cream-300 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                  <h4 className="font-serif text-base font-bold text-charcoal-900">
                    Selected Food Pre-Order ({selectedDishesArray.length} items)
                  </h4>
                  <span className="text-sm font-bold text-burgundy-600">
                    Estimated Total: ${estimatedFoodTotal.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedDishesArray.map(({ dish, quantity }) => (
                    <div
                      key={dish._id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-cream-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-burgundy-600">{quantity}x</span>
                        <span className="text-charcoal-900 font-semibold">{dish.name}</span>
                        <span className="text-[11px] text-charcoal-400">(${dish.price.toFixed(2)} each)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-charcoal-800">
                          ${(dish.price * quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(dish._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 6: CONFIRM RESERVATION ================= */}
        {currentStep === 6 && (
          <div className="bg-white border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-cream-200 pb-4">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                Review Your Booking Details
              </h3>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Please double check all information below before confirming your table.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-1">
                <span className="text-charcoal-500 text-[10px] uppercase font-bold">Restaurant</span>
                <div className="font-serif font-bold text-base text-charcoal-900">{selectedRestaurant?.name}</div>
                <div className="text-charcoal-600">{selectedRestaurant?.address}, {selectedRestaurant?.city}</div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-1">
                <span className="text-charcoal-500 text-[10px] uppercase font-bold">Customer Info</span>
                <div className="font-bold text-sm text-charcoal-900">{customerName}</div>
                <div className="text-charcoal-600">{customerPhone} • {customerEmail}</div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-1">
                <span className="text-charcoal-500 text-[10px] uppercase font-bold">Booking Schedule</span>
                <div className="font-bold text-sm text-charcoal-900">{bookingDate}</div>
                <div className="text-burgundy-600 font-bold">{bookingTime}</div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-1">
                <span className="text-charcoal-500 text-[10px] uppercase font-bold">Guests & Table</span>
                <div className="font-bold text-sm text-charcoal-900">{guestsCount} Guest(s)</div>
                <div className="text-emerald-700 font-semibold">Table Available & Reserved</div>
              </div>
            </div>

            {/* Menu summary */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-charcoal-600">Menu Preference:</span>
                <span className="text-burgundy-600 uppercase">
                  {menuPreference === 'YES' ? 'Food Pre-Order Selected' : 'Order at Restaurant Table'}
                </span>
              </div>

              {menuPreference === 'YES' && selectedDishesArray.length > 0 ? (
                <div className="space-y-1.5 pt-2 border-t border-cream-200 text-xs">
                  {selectedDishesArray.map(({ dish, quantity }) => (
                    <div key={dish._id} className="flex justify-between text-charcoal-700">
                      <span>{quantity}x {dish.name}</span>
                      <span className="font-mono font-bold">${(dish.price * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm text-charcoal-900 pt-2 border-t border-cream-200">
                    <span>Estimated Food Total:</span>
                    <span className="text-burgundy-600">${estimatedFoodTotal.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-charcoal-500">No food pre-ordered. You will order directly at the restaurant table.</p>
              )}
            </div>

            {specialRequests && (
              <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-charcoal-700">
                <span className="font-bold text-charcoal-900">Special Request: </span>
                {specialRequests}
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="flex items-center justify-between pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-xl bg-white hover:bg-cream-200 text-charcoal-800 text-xs font-bold border border-cream-300 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmReservation}
              disabled={submitting}
              className="px-9 py-4 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? 'Confirming Table...' : 'Confirm & Book Table'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizardPage;

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCustomers,
  getCustomerDetails,
  updateCustomer,
  getRestaurants,
  addRestaurant,
  updateRestaurantStatus,
  updateRestaurant,
  getRestaurantMenu,
  getAllReservations,
  updateReservation,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/dashboard-stats', getDashboardStats);

// Customer Management
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetails);
router.put('/customers/:id', updateCustomer);

// Restaurant Management
router.get('/restaurants', getRestaurants);
router.post('/restaurants', addRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.put('/restaurants/:id/status', updateRestaurantStatus);
router.get('/restaurants/:id/menu', getRestaurantMenu);

// Reservation Management
router.get('/reservations', getAllReservations);
router.put('/reservations/:id', updateReservation);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;


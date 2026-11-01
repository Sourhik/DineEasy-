const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getProfile,
  updateProfile,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getReservations,
  updateReservationStatus,
  getTables,
  addTable,
  getMyRestaurants,
  switchRestaurant,
} = require('../controllers/restaurantDashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('restaurant_owner', 'admin'));

// Multi-Restaurant Switcher routes
router.get('/my-restaurants', getMyRestaurants);
router.post('/switch/:id', switchRestaurant);

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Menu CRUD
router.get('/menu', getMenuItems);
router.post('/menu', addMenuItem);
router.put('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);

// Reservations
router.get('/reservations', getReservations);
router.put('/reservations/:id/status', updateReservationStatus);

// Tables
router.get('/tables', getTables);
router.post('/tables', addTable);

module.exports = router;

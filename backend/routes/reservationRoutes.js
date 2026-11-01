const express = require('express');
const router = express.Router();
const {
  checkAvailability,
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

// Public route to check availability before booking
router.post('/check-availability', checkAvailability);

// Customer reservation submission (optional auth or protected)
router.post('/', (req, res, next) => {
  // If authorization header exists, run protect, otherwise proceed
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createReservation);

// Authenticated customer routes
router.get('/my', protect, getMyReservations);
router.get('/:id', getReservationById);
router.put('/:id/cancel', protect, cancelReservation);

module.exports = router;


const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  requestPhoneOtp,
  verifyPhoneOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/phone-otp-request', requestPhoneOtp);
router.post('/phone-otp-verify', verifyPhoneOtp);
router.post('/forgot-password', forgotPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;


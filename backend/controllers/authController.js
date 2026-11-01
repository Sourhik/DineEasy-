const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dineeasy_super_secret_jwt_key_2026_987654321', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: ['customer', 'restaurant_owner'].includes(role) ? role : 'customer',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // If restaurant_owner, attach their restaurant details
    let restaurant = null;
    if (user.role === 'restaurant_owner') {
      restaurant = await Restaurant.findOne({ ownerId: user._id });
      if (restaurant && !user.restaurantId) {
        user.restaurantId = restaurant._id;
        await user.save();
      }
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
        restaurantId: user.restaurantId || (restaurant ? restaurant._id : null),
        restaurant: restaurant ? {
          id: restaurant._id,
          name: restaurant.name,
          status: restaurant.status,
          image: restaurant.image,
        } : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let restaurant = null;
    if (user.role === 'restaurant_owner') {
      restaurant = await Restaurant.findOne({ ownerId: user._id });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
        restaurantId: user.restaurantId || (restaurant ? restaurant._id : null),
        restaurant,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot / Reset password simulation
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide registered email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address' });
    }

    if (newPassword) {
      user.password = newPassword;
      await user.save();
      return res.json({
        success: true,
        message: 'Password has been successfully updated! You can now log in.',
      });
    }

    // Default password reset response
    return res.json({
      success: true,
      message: 'Password reset link / temporary pin has been generated. Enter a new password to proceed.',
      resetAllowed: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// In-memory OTP storage: phone -> { otp, expiresAt }
const otpStore = new Map();

// @desc    Request an OTP for phone number login (Restaurant Owners & Diners)
// @route   POST /api/auth/phone-otp-request
exports.requestPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    
    // Check if user exists with this phone number (supporting variations)
    let user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: phone.trim() },
        { phone: { $regex: cleanPhone.slice(-7), $options: 'i' } }
      ]
    });

    // For effortless usability and reliable demo testing:
    // Generate a 6-digit OTP (fixed to 123456 or random)
    const otp = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(cleanPhone, { otp, expiresAt });

    return res.json({
      success: true,
      message: `Verification code sent to ${phone}! For testing convenience, use OTP: 123456`,
      demoOtp: '123456',
      userExists: !!user,
      role: user ? user.role : 'restaurant_owner'
    });
  } catch (error) {
    console.error('Phone OTP request error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP and log in user via phone
// @route   POST /api/auth/phone-otp-verify
exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp, role = 'restaurant_owner', name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and verification code are required' });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const record = otpStore.get(cleanPhone);

    // Accept demo OTP '123456' or matching recorded OTP
    const isValid = otp === '123456' || (record && record.otp === otp && Date.now() <= record.expiresAt);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please use 123456' });
    }

    // Find existing user or auto-register if new phone
    let user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: phone.trim() },
        { phone: { $regex: cleanPhone.slice(-7), $options: 'i' } }
      ]
    });

    if (!user) {
      // Auto create restaurant owner or customer account
      const randomEmail = `user_${Date.now()}@dineeasy.local`;
      user = await User.create({
        name: name || (role === 'restaurant_owner' ? 'Restaurant Manager' : 'Valued Diner'),
        email: randomEmail,
        password: 'password123',
        phone: cleanPhone,
        role: role,
        status: 'active'
      });
    }

    // Attach restaurant if restaurant owner
    let restaurant = null;
    if (user.role === 'restaurant_owner') {
      restaurant = await Restaurant.findOne({
        $or: [{ ownerId: user._id }, { phone: cleanPhone }]
      });
      if (restaurant && !user.restaurantId) {
        user.restaurantId = restaurant._id;
        await user.save();
      }
    }

    // Clear used OTP
    otpStore.delete(cleanPhone);

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        restaurantId: user.restaurantId || (restaurant ? restaurant._id : null),
        restaurant: restaurant ? {
          id: restaurant._id,
          name: restaurant.name,
          status: restaurant.status,
          image: restaurant.image,
        } : null,
      },
    });
  } catch (error) {
    console.error('Phone OTP verify error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation');
const MenuItem = require('../models/MenuItem');
const AdminSettings = require('../models/AdminSettings');

// @desc    Get Super Admin dashboard statistics and metrics
// @route   GET /api/admin/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRestaurants = await Restaurant.countDocuments();
    const pendingApprovalRestaurants = await Restaurant.countDocuments({ status: 'pending' });

    const totalReservations = await Reservation.countDocuments();
    const todaysReservations = await Reservation.countDocuments({ date: today });
    const pendingReservations = await Reservation.countDocuments({ status: 'pending' });
    const confirmedReservations = await Reservation.countDocuments({
      status: { $in: ['accepted', 'confirmed'] },
    });
    const cancelledReservations = await Reservation.countDocuments({
      status: { $in: ['cancelled', 'rejected'] },
    });

    // Sum of estimated food totals
    const reservationsWithFood = await Reservation.find({ menuPreference: 'YES' });
    const totalPreorderRevenue = reservationsWithFood.reduce((sum, r) => sum + (r.estimatedFoodTotal || 0), 0);

    // Recent 6 reservations
    const recentReservations = await Reservation.find()
      .populate('restaurantId', 'name image logo')
      .sort({ createdAt: -1 })
      .limit(6);

    // Distribution of bookings by status for chart
    const statusDistribution = [
      { name: 'Pending', count: pendingReservations, color: '#f59e0b' },
      { name: 'Confirmed', count: confirmedReservations, color: '#10b981' },
      { name: 'Cancelled', count: cancelledReservations, color: '#ef4444' },
    ];

    return res.json({
      success: true,
      stats: {
        totalCustomers,
        totalRestaurants,
        pendingApprovalRestaurants,
        totalReservations,
        todaysReservations,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        totalPreorderRevenue: parseFloat(totalPreorderRevenue.toFixed(2)),
      },
      statusDistribution,
      recentReservations,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers with search & filter
// @route   GET /api/admin/customers
exports.getCustomers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { role: 'customer' };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Fetch reservation count for each customer
    const customersWithHistory = await Promise.all(
      customers.map(async (c) => {
        const bookingCount = await Reservation.countDocuments({
          $or: [{ customerId: c._id }, { customerEmail: c.email }],
        });
        return {
          ...c.toObject(),
          totalBookings: bookingCount,
        };
      })
    );

    return res.json({ success: true, count: customersWithHistory.length, customers: customersWithHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single customer details + their booking history
// @route   GET /api/admin/customers/:id
exports.getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const bookings = await Reservation.find({
      $or: [{ customerId: customer._id }, { customerEmail: customer.email }],
    })
      .populate('restaurantId', 'name address phone')
      .sort({ createdAt: -1 });

    return res.json({ success: true, customer, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer details or toggle active status
// @route   PUT /api/admin/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, status } = req.body;
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (status) customer.status = status;

    await customer.save();

    return res.json({ success: true, message: 'Customer updated successfully', customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all restaurants for Super Admin
// @route   GET /api/admin/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const restaurants = await Restaurant.find(query)
      .populate('ownerId', 'name email phone status')
      .sort({ createdAt: -1 });

    const enrichedRestaurants = await Promise.all(
      restaurants.map(async (r) => {
        const reservationsCount = await Reservation.countDocuments({ restaurantId: r._id });
        const menuItemsCount = await MenuItem.countDocuments({ restaurantId: r._id });
        return {
          ...r.toObject(),
          totalReservations: reservationsCount,
          totalMenuItems: menuItemsCount,
        };
      })
    );

    return res.json({ success: true, count: enrichedRestaurants.length, restaurants: enrichedRestaurants });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new restaurant (with owner)
// @route   POST /api/admin/restaurants
exports.addRestaurant = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPassword = 'password123',
      phone,
      email,
      address,
      city,
      description,
      cuisine,
      image,
      logo,
      totalTables = 12,
      status = 'active',
    } = req.body;

    if (!name || !ownerEmail || !address) {
      return res.status(400).json({ success: false, message: 'Restaurant name, owner email, and address are required' });
    }

    // Check or create owner user
    let owner = await User.findOne({ email: ownerEmail.toLowerCase() });
    if (!owner) {
      owner = await User.create({
        name: ownerName || `${name} Manager`,
        email: ownerEmail.toLowerCase(),
        phone: ownerPhone || phone || '555-0199',
        password: ownerPassword,
        role: 'restaurant_owner',
      });
    }

    // Generate unique Restaurant Code if not provided
    const count = await Restaurant.countDocuments();
    const codeNumber = (count + 1).toString().padStart(3, '0');
    const restaurantCode = req.body.restaurantCode || `REST${codeNumber}`;

    const restaurant = await Restaurant.create({
      name,
      restaurantCode,
      ownerId: owner._id,
      email: (email || ownerEmail).toLowerCase(),
      phone: phone || ownerPhone,
      address,
      city: city || 'Metropolis',
      description,
      cuisine: Array.isArray(cuisine) ? cuisine : (cuisine || 'Multi-Cuisine').split(',').map((c) => c.trim()),
      image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
      logo: logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      totalTables,
      status,
    });

    owner.restaurantId = restaurant._id;
    if (!owner.assignedRestaurants) owner.assignedRestaurants = [];
    if (!owner.assignedRestaurants.includes(restaurant._id)) {
      owner.assignedRestaurants.push(restaurant._id);
    }
    await owner.save();

    return res.status(201).json({ success: true, message: 'Restaurant created successfully', restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Reject / Activate / Deactivate restaurant
// @route   PUT /api/admin/restaurants/:id/status
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected', 'active', 'inactive'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.status = status;
    await restaurant.save();

    // Also update owner account status if deactivating
    if (restaurant.ownerId && (status === 'inactive' || status === 'rejected')) {
      await User.findByIdAndUpdate(restaurant.ownerId, { status: 'inactive' });
    } else if (restaurant.ownerId && (status === 'active' || status === 'approved')) {
      await User.findByIdAndUpdate(restaurant.ownerId, { status: 'active' });
    }

    return res.json({ success: true, message: `Restaurant status updated to ${status}`, restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant info
// @route   PUT /api/admin/restaurants/:id
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const fields = ['name', 'email', 'phone', 'address', 'city', 'description', 'image', 'logo', 'status', 'openingHours', 'totalTables'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) restaurant[f] = req.body[f];
    });

    if (req.body.cuisine) {
      restaurant.cuisine = Array.isArray(req.body.cuisine)
        ? req.body.cuisine
        : req.body.cuisine.split(',').map((c) => c.trim()).filter(Boolean);
    }

    await restaurant.save();
    return res.json({ success: true, message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    View specific restaurant's menu for super admin
// @route   GET /api/admin/restaurants/:id/menu
exports.getRestaurantMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.id }).sort({ category: 1, name: 1 });
    return res.json({ success: true, count: items.length, menuItems: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    View all reservations across all restaurants
// @route   GET /api/admin/reservations
exports.getAllReservations = async (req, res) => {
  try {
    const { status, restaurantId, search, date } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (restaurantId && restaurantId !== 'all') {
      query.restaurantId = restaurantId;
    }

    if (date) {
      query.date = date;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const reservations = await Reservation.find(query)
      .populate('restaurantId', 'name address phone email logo')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update / Cancel reservation by Super Admin
// @route   PUT /api/admin/reservations/:id
exports.updateReservation = async (req, res) => {
  try {
    const { status, tableNumber, rejectionReason } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (status) reservation.status = status;
    if (tableNumber) reservation.tableNumber = tableNumber;
    if (rejectionReason !== undefined) reservation.rejectionReason = rejectionReason;

    await reservation.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${reservation.restaurantId.toString()}`).emit('reservation_updated', { reservation });
      io.to('admin_channel').emit('reservation_updated', { reservation });
    }

    return res.json({ success: true, message: 'Reservation updated successfully', reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get & Update platform settings
// @route   GET /api/admin/settings & PUT /api/admin/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    return res.json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings({});
    }

    const { platformName, supportEmail, supportPhone, autoApproveRestaurants, cancellationWindowHours } = req.body;
    if (platformName) settings.platformName = platformName;
    if (supportEmail) settings.supportEmail = supportEmail;
    if (supportPhone) settings.supportPhone = supportPhone;
    if (autoApproveRestaurants !== undefined) settings.autoApproveRestaurants = autoApproveRestaurants;
    if (cancellationWindowHours !== undefined) settings.cancellationWindowHours = cancellationWindowHours;
    settings.updatedAt = new Date();

    await settings.save();
    return res.json({ success: true, message: 'Settings saved successfully', settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


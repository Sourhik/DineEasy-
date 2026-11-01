const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to get active restaurant for logged-in user with strict authorization verification
const getOwnerRestaurant = async (req) => {
  const user = req.user;
  if (!user) return null;

  // Check header 'x-restaurant-id' or query 'restaurantId'
  const requestedId = req.headers['x-restaurant-id'] || req.query.restaurantId;

  if (requestedId && requestedId !== 'undefined' && requestedId !== 'null') {
    let restaurant = null;
    if (mongoose.Types.ObjectId.isValid(requestedId)) {
      restaurant = await Restaurant.findById(requestedId);
    } else {
      restaurant = await Restaurant.findOne({ restaurantCode: requestedId.toUpperCase() });
    }

    if (!restaurant) return null;

    // 1. Super Admin can access ANY restaurant
    if (user.role === 'admin') {
      return restaurant;
    }

    // 2. Normal restaurant owner can access ONLY their assigned/owned restaurants
    const isOwner = restaurant.ownerId && restaurant.ownerId.toString() === user._id.toString();
    const isPrimary = user.restaurantId && user.restaurantId.toString() === restaurant._id.toString();
    const isAssigned =
      user.assignedRestaurants &&
      user.assignedRestaurants.some((rid) => rid.toString() === restaurant._id.toString());

    if (isOwner || isPrimary || isAssigned) {
      return restaurant;
    }

    // Unauthorized restaurant switch attempt blocked
    return null;
  }

  // Fallback to active restaurantId on user model, or first owned/assigned restaurant
  if (user.restaurantId) {
    const rest = await Restaurant.findById(user.restaurantId);
    if (rest) return rest;
  }

  let rest = await Restaurant.findOne({ ownerId: user._id });
  if (!rest && user.assignedRestaurants && user.assignedRestaurants.length > 0) {
    rest = await Restaurant.findById(user.assignedRestaurants[0]);
  }
  if (!rest && user.role === 'admin') {
    rest = await Restaurant.findOne();
  }
  return rest;
};

// @desc    Get all restaurants currently authenticated user is authorized to manage
// @route   GET /api/restaurant/my-restaurants
exports.getMyRestaurants = async (req, res) => {
  try {
    const user = req.user;
    let restaurants = [];

    if (user.role === 'admin') {
      restaurants = await Restaurant.find().sort({ name: 1 });
    } else {
      restaurants = await Restaurant.find({
        $or: [
          { ownerId: user._id },
          { _id: user.restaurantId },
          { _id: { $in: user.assignedRestaurants || [] } },
        ],
      }).sort({ name: 1 });
    }

    // Determine current active restaurant
    const activeRest = await getOwnerRestaurant(req);
    const activeId = activeRest ? activeRest._id.toString() : null;

    const list = restaurants.map((r) => ({
      _id: r._id,
      restaurantCode: r.restaurantCode || `REST${r._id.toString().slice(-4).toUpperCase()}`,
      name: r.name,
      logo: r.logo,
      image: r.image,
      address: r.address,
      city: r.city,
      status: r.status,
      cuisine: r.cuisine,
      totalTables: r.totalTables || 12,
      isCurrent: activeId ? r._id.toString() === activeId : false,
    }));

    return res.json({
      success: true,
      count: list.length,
      currentRestaurantId: activeId,
      restaurants: list,
    });
  } catch (error) {
    console.error('getMyRestaurants error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Switch active restaurant with authorization verification
// @route   POST /api/restaurant/switch/:id
exports.switchRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    let targetRestaurant = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      targetRestaurant = await Restaurant.findById(id);
    } else {
      targetRestaurant = await Restaurant.findOne({ restaurantCode: id.toUpperCase() });
    }

    if (!targetRestaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Security check: verify user authorization
    let isAuthorized = false;
    if (user.role === 'admin') {
      isAuthorized = true;
    } else {
      const isOwner =
        targetRestaurant.ownerId && targetRestaurant.ownerId.toString() === user._id.toString();
      const isPrimary =
        user.restaurantId && user.restaurantId.toString() === targetRestaurant._id.toString();
      const isAssigned =
        user.assignedRestaurants &&
        user.assignedRestaurants.some((rid) => rid.toString() === targetRestaurant._id.toString());

      if (isOwner || isPrimary || isAssigned) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You are not authorized to manage "${targetRestaurant.name}".`,
      });
    }

    // Update active restaurant in user record
    user.restaurantId = targetRestaurant._id;
    if (!user.assignedRestaurants) user.assignedRestaurants = [];
    if (!user.assignedRestaurants.some((rid) => rid.toString() === targetRestaurant._id.toString())) {
      user.assignedRestaurants.push(targetRestaurant._id);
    }
    await user.save();

    return res.json({
      success: true,
      message: `You are now managing ${targetRestaurant.name}.`,
      restaurant: {
        _id: targetRestaurant._id,
        id: targetRestaurant._id,
        restaurantCode: targetRestaurant.restaurantCode || `REST${targetRestaurant._id.toString().slice(-4).toUpperCase()}`,
        name: targetRestaurant.name,
        logo: targetRestaurant.logo,
        image: targetRestaurant.image,
        address: targetRestaurant.address,
        city: targetRestaurant.city,
        status: targetRestaurant.status,
      },
    });
  } catch (error) {
    console.error('switchRestaurant error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant dashboard statistics
// @route   GET /api/restaurant/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or restaurant profile not found for this account',
      });
    }

    const restaurantId = restaurant._id;
    const today = new Date().toISOString().split('T')[0];

    const totalReservations = await Reservation.countDocuments({ restaurantId });
    const todaysBookings = await Reservation.countDocuments({ restaurantId, date: today });
    const pendingBookings = await Reservation.countDocuments({ restaurantId, status: 'pending' });
    const confirmedBookings = await Reservation.countDocuments({
      restaurantId,
      status: { $in: ['accepted', 'confirmed'] },
    });
    const cancelledBookings = await Reservation.countDocuments({
      restaurantId,
      status: { $in: ['cancelled', 'rejected'] },
    });
    const upcomingBookings = await Reservation.countDocuments({
      restaurantId,
      date: { $gte: today },
      status: { $nin: ['cancelled', 'rejected'] },
    });
    const totalMenuItems = await MenuItem.countDocuments({ restaurantId });
    const activeMenuItems = await MenuItem.countDocuments({
      restaurantId,
      isAvailable: true,
      isPublished: true,
    });

    // Recent 5 reservations for this restaurant
    const recentReservations = await Reservation.find({ restaurantId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        _id: restaurant._id,
        restaurantCode: restaurant.restaurantCode || `REST${restaurant._id.toString().slice(-4).toUpperCase()}`,
        name: restaurant.name,
        status: restaurant.status,
        image: restaurant.image,
        logo: restaurant.logo,
        address: restaurant.address,
        city: restaurant.city,
      },
      stats: {
        totalReservations,
        todaysBookings,
        upcomingBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalMenuItems,
        activeMenuItems,
      },
      recentReservations,
    });
  } catch (error) {
    console.error('Restaurant stats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant profile
// @route   GET /api/restaurant/profile
exports.getProfile = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    return res.json({ success: true, restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant profile
// @route   PUT /api/restaurant/profile
exports.updateProfile = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const {
      name,
      description,
      phone,
      email,
      address,
      city,
      openingHours,
      cuisine,
      image,
      logo,
      totalTables,
    } = req.body;

    if (name) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (phone) restaurant.phone = phone;
    if (email) restaurant.email = email;
    if (address) restaurant.address = address;
    if (city) restaurant.city = city;
    if (openingHours) restaurant.openingHours = openingHours;
    if (image) restaurant.image = image;
    if (logo) restaurant.logo = logo;
    if (totalTables) restaurant.totalTables = totalTables;
    if (cuisine) {
      restaurant.cuisine = Array.isArray(cuisine)
        ? cuisine
        : cuisine.split(',').map((c) => c.trim()).filter(Boolean);
    }

    await restaurant.save();

    return res.json({
      success: true,
      message: 'Restaurant profile updated successfully',
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all menu items for the restaurant (including unpublished & unavailable)
// @route   GET /api/restaurant/menu
exports.getMenuItems = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const items = await MenuItem.find({ restaurantId: restaurant._id }).sort({ category: 1, name: 1 });
    return res.json({ success: true, count: items.length, menuItems: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new food item to restaurant menu
// @route   POST /api/restaurant/menu
exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const {
      name,
      category,
      description,
      price,
      image,
      dietary = 'non-veg',
      isAvailable = true,
      isPublished = true,
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Dish name, category, and price are required' });
    }

    const item = await MenuItem.create({
      restaurantId: restaurant._id,
      name,
      category,
      description,
      price: parseFloat(price),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
      dietary,
      isAvailable,
      isPublished,
    });

    // Notify connected customers or real-time menu sync
    const io = req.app.get('io');
    if (io) {
      io.emit('menu_updated', { restaurantId: restaurant._id });
    }

    return res.status(201).json({
      success: true,
      message: 'Food item added to menu successfully',
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/restaurant/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: restaurant._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found or unauthorized' });
    }

    const { name, category, description, price, image, dietary, isAvailable, isPublished } = req.body;

    if (name) item.name = name;
    if (category) item.category = category;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = parseFloat(price);
    if (image) item.image = image;
    if (dietary) item.dietary = dietary;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;
    if (isPublished !== undefined) item.isPublished = isPublished;

    await item.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('menu_updated', { restaurantId: restaurant._id });
    }

    return res.json({
      success: true,
      message: 'Food item updated successfully',
      item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete food item
// @route   DELETE /api/restaurant/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, restaurantId: restaurant._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found or unauthorized' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('menu_updated', { restaurantId: restaurant._id });
    }

    return res.json({ success: true, message: 'Food item deleted from menu' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reservations for this restaurant
// @route   GET /api/restaurant/reservations
exports.getReservations = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const { status, date, search } = req.query;
    let query = { restaurantId: restaurant._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      query.date = date;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const reservations = await Reservation.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update reservation status (Accept, Reject, Confirm, Cancel, Assign Table)
// @route   PUT /api/restaurant/reservations/:id/status
exports.updateReservationStatus = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const { status, tableNumber, rejectionReason } = req.body;
    const allowedStatuses = ['pending', 'accepted', 'rejected', 'confirmed', 'cancelled', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const reservation = await Reservation.findOne({ _id: req.params.id, restaurantId: restaurant._id });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.status = status;
    if (tableNumber) reservation.tableNumber = tableNumber;
    if (rejectionReason !== undefined) reservation.rejectionReason = rejectionReason;

    await reservation.save();

    // Create Notification for Customer
    let statusLabel = status.toUpperCase();
    const notif = await Notification.create({
      recipientRole: 'customer',
      recipientId: reservation.customerId,
      restaurantId: restaurant._id,
      title: `Booking ${reservation.bookingId} ${statusLabel}!`,
      message: `Your reservation at ${restaurant.name} for ${reservation.guestsCount} guests on ${reservation.date} has been marked as ${status}.`,
      type: status === 'accepted' || status === 'confirmed' ? 'booking_accepted' : 'booking_rejected',
      reservationId: reservation._id,
    });

    const io = req.app.get('io');
    if (io) {
      if (reservation.customerId) {
        io.to(`user_${reservation.customerId.toString()}`).emit('reservation_status_changed', {
          reservation,
          notification: notif,
        });
      }
      io.to(`restaurant_${restaurant._id.toString()}`).emit('reservation_updated', { reservation });
      io.to('admin_channel').emit('reservation_updated', { reservation });
    }

    return res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      reservation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tables for the restaurant
// @route   GET /api/restaurant/tables
exports.getTables = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const tables = await Table.find({ restaurantId: restaurant._id }).sort({ tableNumber: 1 });
    return res.json({ success: true, count: tables.length, tables });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add table
// @route   POST /api/restaurant/tables
exports.addTable = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req);
    if (!restaurant) {
      return res.status(403).json({ success: false, message: 'Access denied or restaurant not found' });
    }

    const { tableNumber, capacity, location = 'indoor' } = req.body;
    if (!tableNumber || !capacity) {
      return res.status(400).json({ success: false, message: 'Table number and capacity are required' });
    }

    const table = await Table.create({
      restaurantId: restaurant._id,
      tableNumber,
      capacity: parseInt(capacity, 10),
      location,
      isAvailable: true,
    });

    return res.status(201).json({ success: true, message: 'Table added', table });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

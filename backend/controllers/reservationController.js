const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const Notification = require('../models/Notification');

// Helper to generate unique booking ID
const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DE-${new Date().getFullYear()}-${code}`;
};

// @desc    Check table availability for date, time slot, and guest count
// @route   POST /api/reservations/check-availability
exports.checkAvailability = async (req, res) => {
  try {
    const { restaurantId, date, timeSlot, guestsCount } = req.body;

    if (!restaurantId || !date || !timeSlot || !guestsCount) {
      return res.status(400).json({ success: false, message: 'All booking fields are required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Find tables for this restaurant
    const tables = await Table.find({ restaurantId });
    const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

    // Find existing confirmed or pending reservations at this exact date & time slot
    const existingReservations = await Reservation.find({
      restaurantId,
      date,
      timeSlot,
      status: { $in: ['pending', 'accepted', 'confirmed'] },
    });

    const bookedGuests = existingReservations.reduce((acc, r) => acc + r.guestsCount, 0);
    const availableCapacity = (totalCapacity > 0 ? totalCapacity : 40) - bookedGuests;

    const isAvailable = availableCapacity >= parseInt(guestsCount, 10);

    // Available time slots preview
    const standardSlots = [
      '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
      '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM'
    ];

    return res.json({
      success: true,
      isAvailable,
      availableCapacity: Math.max(0, availableCapacity),
      availableTimeSlots: standardSlots,
      message: isAvailable
        ? `Tables are available for ${guestsCount} guest(s) on ${date} at ${timeSlot}`
        : `Sorry, this time slot has reached maximum capacity. Please choose another time.`,
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new table reservation
// @route   POST /api/reservations
exports.createReservation = async (req, res) => {
  try {
    const {
      restaurantId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      timeSlot,
      guestsCount,
      menuPreference = 'NO',
      selectedItems = [],
      specialRequests = '',
    } = req.body;

    if (!restaurantId || !customerName || !customerEmail || !customerPhone || !date || !timeSlot || !guestsCount) {
      return res.status(400).json({ success: false, message: 'Missing required reservation fields' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // If customer selected menu items, calculate food total and verify menu items belong to this restaurant
    let estimatedFoodTotal = 0;
    const validatedItems = [];

    if (menuPreference === 'YES' && Array.isArray(selectedItems) && selectedItems.length > 0) {
      for (const item of selectedItems) {
        if (!item.menuItemId || !item.quantity || item.quantity <= 0) continue;
        const dbItem = await MenuItem.findOne({ _id: item.menuItemId, restaurantId });
        if (dbItem) {
          const qty = parseInt(item.quantity, 10);
          const lineTotal = dbItem.price * qty;
          estimatedFoodTotal += lineTotal;
          validatedItems.push({
            menuItemId: dbItem._id,
            name: dbItem.name,
            price: dbItem.price,
            quantity: qty,
            category: dbItem.category,
            image: dbItem.image,
          });
        }
      }
    }

    // Auto assign an available table if configured
    const assignedTable = await Table.findOne({
      restaurantId,
      capacity: { $gte: parseInt(guestsCount, 10) },
      isAvailable: true,
    });

    const bookingId = generateBookingId();

    const reservation = await Reservation.create({
      bookingId,
      customerId: req.user ? req.user._id : null,
      restaurantId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      timeSlot,
      guestsCount: parseInt(guestsCount, 10),
      tableNumber: assignedTable ? `Table #${assignedTable.tableNumber}` : 'Table Assigned on Arrival',
      menuPreference,
      selectedItems: validatedItems,
      estimatedFoodTotal: parseFloat(estimatedFoodTotal.toFixed(2)),
      status: 'pending',
      specialRequests,
    });

    // Create notifications for Restaurant Owner and Super Admin
    const restaurantNotification = await Notification.create({
      recipientRole: 'restaurant_owner',
      restaurantId: restaurant._id,
      title: 'New Table Reservation Received!',
      message: `New booking ${bookingId} by ${customerName} for ${guestsCount} guests on ${date} at ${timeSlot}.`,
      type: 'new_booking',
      reservationId: reservation._id,
    });

    const adminNotification = await Notification.create({
      recipientRole: 'super_admin',
      title: 'New Platform Booking',
      message: `${customerName} booked a table at "${restaurant.name}" (${bookingId}).`,
      type: 'new_booking',
      reservationId: reservation._id,
    });

    // Trigger Socket.IO real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurant._id.toString()}`).emit('new_reservation', {
        reservation,
        notification: restaurantNotification,
      });
      io.to('admin_channel').emit('new_reservation', {
        reservation,
        restaurantName: restaurant.name,
        notification: adminNotification,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Reservation submitted successfully! Your booking is pending confirmation.',
      reservation,
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's reservations
// @route   GET /api/reservations/my
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      $or: [
        { customerId: req.user._id },
        { customerEmail: req.user.email },
      ],
    })
      .populate('restaurantId', 'name address phone image logo cuisine')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single reservation details
// @route   GET /api/reservations/:id
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('restaurantId', 'name address phone image logo email cuisine');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    return res.json({ success: true, reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer cancels reservation
// @route   PUT /api/reservations/:id/cancel
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Verify ownership
    if (
      req.user.role !== 'admin' &&
      reservation.customerId?.toString() !== req.user._id.toString() &&
      reservation.customerEmail !== req.user.email
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this reservation' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Reservation is already cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Notify Restaurant
    const notif = await Notification.create({
      recipientRole: 'restaurant_owner',
      restaurantId: reservation.restaurantId,
      title: 'Reservation Cancelled by Customer',
      message: `Reservation ${reservation.bookingId} by ${reservation.customerName} has been cancelled.`,
      type: 'booking_cancelled',
      reservationId: reservation._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${reservation.restaurantId.toString()}`).emit('reservation_updated', {
        reservation,
        notification: notif,
      });
      io.to('admin_channel').emit('reservation_updated', { reservation });
    }

    return res.json({ success: true, message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


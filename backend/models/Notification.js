const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientRole: {
    type: String,
    enum: ['super_admin', 'restaurant_owner', 'customer'],
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['new_booking', 'booking_accepted', 'booking_rejected', 'booking_cancelled', 'system'],
    default: 'new_booking',
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);


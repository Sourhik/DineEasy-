const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  timeSlot: {
    type: String, // e.g. "19:00"
    required: true,
  },
  guestsCount: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
  tableNumber: {
    type: String,
    default: 'Table Assigned on Arrival',
  },
  menuPreference: {
    type: String,
    enum: ['YES', 'NO'],
    default: 'NO',
  },
  selectedItems: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
      name: String,
      price: Number,
      quantity: Number,
      category: String,
      image: String,
    },
  ],
  estimatedFoodTotal: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  specialRequests: {
    type: String,
    default: '',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Reservation', reservationSchema);


const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  restaurantCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: [true, 'Restaurant email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Restaurant phone is required'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    default: 'Metropolis',
  },
  description: {
    type: String,
    default: '',
  },
  cuisine: {
    type: [String],
    default: ['Multi-Cuisine'],
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  },
  openingHours: {
    type: String,
    default: '11:00 AM - 11:00 PM',
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$',
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  totalTables: {
    type: Number,
    default: 12,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);


const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Dish category is required'],
    enum: ['Starters', 'Main Course', 'Desserts', 'Drinks', 'Chef Specials'],
    default: 'Main Course',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
  },
  dietary: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan'],
    default: 'non-veg',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);


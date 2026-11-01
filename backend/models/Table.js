const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  tableNumber: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'terrace', 'private_dining', 'rooftop'],
    default: 'indoor',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Table', tableSchema);


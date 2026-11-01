const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'DineEasy',
  },
  supportEmail: {
    type: String,
    default: 'support@dineeasy.com',
  },
  supportPhone: {
    type: String,
    default: '+1 (800) 555-DINE',
  },
  autoApproveRestaurants: {
    type: Boolean,
    default: false,
  },
  cancellationWindowHours: {
    type: Number,
    default: 2,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);


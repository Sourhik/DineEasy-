const Notification = require('../models/Notification');

// @desc    Get notifications for logged-in user / restaurant / admin
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = { recipientRole: 'super_admin' };
    } else if (req.user.role === 'restaurant_owner') {
      const activeRestId = req.headers['x-restaurant-id'] || req.user.restaurantId;
      query = {
        recipientRole: 'restaurant_owner',
        restaurantId: activeRestId,
      };
    } else {
      query = {
        recipientRole: 'customer',
        recipientId: req.user._id,
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    return res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = { recipientRole: 'super_admin' };
    } else if (req.user.role === 'restaurant_owner') {
      const activeRestId = req.headers['x-restaurant-id'] || req.user.restaurantId;
      query = {
        recipientRole: 'restaurant_owner',
        restaurantId: activeRestId,
      };
    } else {
      query = {
        recipientRole: 'customer',
        recipientId: req.user._id,
      };
    }

    await Notification.updateMany(query, { isRead: true });
    return res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


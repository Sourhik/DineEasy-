const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Get all active restaurants with search & filtering
// @route   GET /api/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, city, sortBy } = req.query;
    let query = { status: { $in: ['active', 'approved'] } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
      ];
    }

    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $regex: cuisine, $options: 'i' };
    }

    if (city && city !== 'All') {
      query.city = { $regex: city, $options: 'i' };
    }

    let sortOption = { rating: -1 };
    if (sortBy === 'name') sortOption = { name: 1 };
    if (sortBy === 'newest') sortOption = { createdAt: -1 };

    const restaurants = await Restaurant.find(query).sort(sortOption);

    return res.json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant details by ID
// @route   GET /api/restaurants/:id
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    return res.json({ success: true, restaurant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant's published menu items (strictly filtered to this restaurant)
// @route   GET /api/restaurants/:id/menu
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // ONLY fetch published and available items for THIS restaurant
    const menuItems = await MenuItem.find({
      restaurantId: id,
      isPublished: true,
    }).sort({ category: 1, name: 1 });

    // Group items by category for convenience
    const categories = ['Starters', 'Main Course', 'Desserts', 'Drinks', 'Chef Specials'];
    const grouped = {};
    categories.forEach((cat) => {
      grouped[cat] = menuItems.filter((item) => item.category === cat);
    });

    return res.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
      },
      count: menuItems.length,
      menuItems,
      grouped,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get unique cuisines list
// @route   GET /api/cuisines
exports.getCuisines = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ status: { $in: ['active', 'approved'] } });
    const cuisinesSet = new Set();
    restaurants.forEach((r) => {
      if (Array.isArray(r.cuisine)) {
        r.cuisine.forEach((c) => cuisinesSet.add(c.trim()));
      }
    });

    return res.json({
      success: true,
      cuisines: ['All', ...Array.from(cuisinesSet)],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


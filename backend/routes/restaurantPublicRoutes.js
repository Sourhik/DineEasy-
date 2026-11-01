const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getCuisines,
} = require('../controllers/restaurantPublicController');

router.get('/', getRestaurants);
router.get('/cuisines', getCuisines);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);

module.exports = router;


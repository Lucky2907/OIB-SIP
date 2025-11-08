const express = require('express');
const router = express.Router();
const {
  createGooglePayOrder,
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  calculatePrice
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-googlepay-order', protect, createGooglePayOrder);
router.post('/calculate-price', protect, calculatePrice);
router.post('/', protect, createOrder);
router.get('/', protect, authorize('admin'), getAllOrders);
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryByCategory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getInventory);
router.get('/category/:category', getInventoryByCategory);
router.get('/low-stock', protect, authorize('admin'), getLowStockItems);
router.get('/:id', getInventoryItem);
router.post('/', protect, authorize('admin'), createInventoryItem);
router.put('/:id', protect, authorize('admin'), updateInventoryItem);
router.delete('/:id', protect, authorize('admin'), deleteInventoryItem);
router.post('/update-stock', protect, updateStock);

module.exports = router;

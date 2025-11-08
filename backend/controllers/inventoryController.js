const Inventory = require('../models/Inventory');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public
exports.getInventory = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, isAvailable: true } : { isAvailable: true };
    
    const items = await Inventory.find(filter);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get inventory by category
// @route   GET /api/inventory/category/:category
// @access  Public
exports.getInventoryByCategory = async (req, res) => {
  try {
    const items = await Inventory.find({ 
      category: req.params.category,
      isAvailable: true 
    });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Public
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private/Admin
exports.createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update stock after order
// @route   POST /api/inventory/update-stock
// @access  Private
exports.updateStock = async (req, res) => {
  try {
    const { items } = req.body; // items: [{id, quantity}]
    
    const lowStockItems = [];
    
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.id);
      
      if (!inventoryItem) {
        continue;
      }
      
      inventoryItem.quantity -= item.quantity;
      
      // Check if below threshold
      if (inventoryItem.quantity <= inventoryItem.threshold) {
        lowStockItems.push({
          name: inventoryItem.name,
          category: inventoryItem.category,
          quantity: inventoryItem.quantity,
          threshold: inventoryItem.threshold
        });
      }
      
      // Mark as unavailable if out of stock
      if (inventoryItem.quantity <= 0) {
        inventoryItem.isAvailable = false;
        inventoryItem.quantity = 0;
      }
      
      await inventoryItem.save();
    }
    
    // Send alert email if low stock
    if (lowStockItems.length > 0) {
      const itemsList = lowStockItems.map(item => 
        `<li><strong>${item.name}</strong> (${item.category}): ${item.quantity} units (Threshold: ${item.threshold})</li>`
      ).join('');
      
      const message = `
        <h1>Low Stock Alert</h1>
        <p>The following items are running low on stock:</p>
        <ul>${itemsList}</ul>
        <p>Please restock these items as soon as possible.</p>
      `;
      
      try {
        await sendEmail({
          email: process.env.ADMIN_EMAIL,
          subject: 'Low Stock Alert - Pizza App',
          message
        });
      } catch (emailError) {
        console.error('Error sending stock alert email:', emailError);
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Stock updated successfully',
      lowStockItems 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private/Admin
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    });
    
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

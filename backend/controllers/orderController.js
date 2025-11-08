const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// Google Pay integration
// Note: Google Pay is client-side. Backend just validates and processes the payment token

// @desc    Create Google Pay order (validates payment and creates order)
// @route   POST /api/orders/create-googlepay-order
// @access  Private
exports.createGooglePayOrder = async (req, res) => {
  try {
    const { amount, paymentToken } = req.body;
    
    if (!paymentToken) {
      return res.status(400).json({
        success: false,
        message: 'Payment token is required from Google Pay'
      });
    }
    
    // In production, you would verify the payment token with Google Pay API
    // For now, we'll simulate a successful payment validation
    const paymentValidated = true; // Replace with actual Google Pay verification
    
    if (!paymentValidated) {
      return res.status(400).json({
        success: false,
        message: 'Payment validation failed'
      });
    }
    
    // Generate a transaction ID
    const transactionId = `googlepay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.status(200).json({ 
      success: true, 
      data: {
        transactionId,
        amount,
        currency: 'INR',
        status: 'authorized'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    console.log('Creating order - Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    
    const { customPizza, totalPrice, paymentId } = req.body;
    
    if (!customPizza || !customPizza.base || !customPizza.sauce) {
      return res.status(400).json({
        success: false,
        message: 'Base and sauce are required'
      });
    }
    
    // Validate stock availability - only check items that are provided
    const items = [
      customPizza.base,
      customPizza.sauce,
      customPizza.cheese, // May be null/undefined
      ...(customPizza.veggies || []),
      ...(customPizza.meat || [])
    ].filter(Boolean); // Remove null/undefined values
    
    console.log('Items to validate:', items);
    
    for (const itemId of items) {
      const item = await Inventory.findById(itemId);
      console.log(`Checking item ${itemId}:`, item);
      if (!item || !item.isAvailable || item.quantity <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Item ${item?.name || 'unknown'} is not available` 
        });
      }
    }
    
    // Create order
    const order = await Order.create({
      user: req.user.id,
      customPizza,
      totalPrice,
      paymentId,
      paymentStatus: 'completed'
    });
    
    // Populate order details
    await order.populate([
      { path: 'customPizza.base' },
      { path: 'customPizza.sauce' },
      { path: 'customPizza.cheese' },
      { path: 'customPizza.veggies' },
      { path: 'customPizza.meat' },
      { path: 'user', select: 'name email' }
    ]);
    
    // Update inventory stock
    const stockUpdates = items.map(itemId => ({ id: itemId, quantity: 1 }));
    
    // Call inventory update (this will handle low stock alerts)
    const axios = require('axios');
    try {
      await require('../controllers/inventoryController').updateStock(
        { body: { items: stockUpdates } },
        { status: () => ({ json: () => {} }) }
      );
    } catch (stockError) {
      console.error('Stock update error:', stockError);
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', order);
    }
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('customPizza.base')
      .populate('customPizza.sauce')
      .populate('customPizza.cheese')
      .populate('customPizza.veggies')
      .populate('customPizza.meat')
      .sort('-createdAt');
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('customPizza.base')
      .populate('customPizza.sauce')
      .populate('customPizza.cheese')
      .populate('customPizza.veggies')
      .populate('customPizza.meat')
      .sort('-createdAt');
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('customPizza.base')
      .populate('customPizza.sauce')
      .populate('customPizza.cheese')
      .populate('customPizza.veggies')
      .populate('customPizza.meat');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')
      .populate('customPizza.base')
      .populate('customPizza.sauce')
      .populate('customPizza.cheese')
      .populate('customPizza.veggies')
      .populate('customPizza.meat');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Emit socket event for real-time update to user
    const io = req.app.get('io');
    if (io) {
      io.to(order.user._id.toString()).emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status
      });
    }
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate pizza price
// @route   POST /api/orders/calculate-price
// @access  Private
exports.calculatePrice = async (req, res) => {
  try {
    const { base, sauce, cheese, veggies, meat } = req.body;
    
    let totalPrice = 0;
    
    // Add base price
    const baseItem = await Inventory.findById(base);
    if (baseItem) totalPrice += baseItem.price;
    
    // Add sauce price
    const sauceItem = await Inventory.findById(sauce);
    if (sauceItem) totalPrice += sauceItem.price;
    
    // Add cheese price
    const cheeseItem = await Inventory.findById(cheese);
    if (cheeseItem) totalPrice += cheeseItem.price;
    
    // Add veggies prices
    if (veggies && veggies.length > 0) {
      for (const veggieId of veggies) {
        const veggie = await Inventory.findById(veggieId);
        if (veggie) totalPrice += veggie.price;
      }
    }
    
    // Add meat prices
    if (meat && meat.length > 0) {
      for (const meatId of meat) {
        const meatItem = await Inventory.findById(meatId);
        if (meatItem) totalPrice += meatItem.price;
      }
    }
    
    res.status(200).json({ success: true, totalPrice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

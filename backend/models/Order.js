const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customPizza: {
    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    sauce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    cheese: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: false
    },
    veggies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    }],
    meat: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    }]
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'],
    default: 'Order Received'
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

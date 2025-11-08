const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['pizza', 'base', 'sauce', 'cheese', 'veggies', 'meat'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  threshold: {
    type: Number,
    default: 20
  },
  description: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  stock: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);

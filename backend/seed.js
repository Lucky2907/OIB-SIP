require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const User = require('./models/User');
const connectDB = require('./config/db');

const inventoryData = [
  // Ready-to-Order Pizzas
  { 
    name: 'Margherita Pizza', 
    category: 'pizza', 
    quantity: 50, 
    price: 299, 
    threshold: 10,
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
    rating: 4.5,
    stock: 50
  },
  { 
    name: 'Pepperoni Pizza', 
    category: 'pizza', 
    quantity: 45, 
    price: 399, 
    threshold: 10,
    description: 'Loaded with spicy pepperoni and mozzarella cheese',
    rating: 4.8,
    stock: 45
  },
  { 
    name: 'Veggie Supreme', 
    category: 'pizza', 
    quantity: 40, 
    price: 349, 
    threshold: 10,
    description: 'Fresh vegetables with bell peppers, mushrooms, onions, and olives',
    rating: 4.3,
    stock: 40
  },
  { 
    name: 'BBQ Chicken Pizza', 
    category: 'pizza', 
    quantity: 38, 
    price: 429, 
    threshold: 10,
    description: 'Grilled chicken with tangy BBQ sauce and onions',
    rating: 4.7,
    stock: 38
  },
  { 
    name: 'Hawaiian Pizza', 
    category: 'pizza', 
    quantity: 35, 
    price: 379, 
    threshold: 10,
    description: 'Ham and pineapple with mozzarella cheese',
    rating: 4.2,
    stock: 35
  },
  { 
    name: 'Meat Lovers Pizza', 
    category: 'pizza', 
    quantity: 30, 
    price: 499, 
    threshold: 10,
    description: 'Pepperoni, sausage, bacon, and ham loaded with cheese',
    rating: 4.9,
    stock: 30
  },
  { 
    name: 'Four Cheese Pizza', 
    category: 'pizza', 
    quantity: 32, 
    price: 449, 
    threshold: 10,
    description: 'Mozzarella, cheddar, parmesan, and gouda cheese blend',
    rating: 4.6,
    stock: 32
  },
  { 
    name: 'Spicy Mexican Pizza', 
    category: 'pizza', 
    quantity: 28, 
    price: 419, 
    threshold: 10,
    description: 'Jalapenos, onions, bell peppers with spicy sauce',
    rating: 4.4,
    stock: 28
  },
  { 
    name: 'Mushroom Truffle Pizza', 
    category: 'pizza', 
    quantity: 25, 
    price: 549, 
    threshold: 10,
    description: 'Gourmet mushrooms with truffle oil and parmesan',
    rating: 4.8,
    stock: 25
  },
  { 
    name: 'Garden Fresh Pizza', 
    category: 'pizza', 
    quantity: 30, 
    price: 329, 
    threshold: 10,
    description: 'Tomatoes, spinach, corn, and fresh herbs',
    rating: 4.1,
    stock: 30
  },
  
  // Pizza Bases (for customization)
  { name: 'Thin Crust', category: 'base', quantity: 50, price: 100, threshold: 20 },
  { name: 'Thick Crust', category: 'base', quantity: 50, price: 120, threshold: 20 },
  { name: 'Cheese Burst', category: 'base', quantity: 40, price: 150, threshold: 20 },
  { name: 'Whole Wheat', category: 'base', quantity: 30, price: 130, threshold: 20 },
  { name: 'Gluten Free', category: 'base', quantity: 25, price: 180, threshold: 20 },
  
  // Sauces
  { name: 'Marinara Sauce', category: 'sauce', quantity: 60, price: 30, threshold: 20 },
  { name: 'White Sauce', category: 'sauce', quantity: 60, price: 35, threshold: 20 },
  { name: 'Pesto Sauce', category: 'sauce', quantity: 50, price: 40, threshold: 20 },
  { name: 'BBQ Sauce', category: 'sauce', quantity: 55, price: 35, threshold: 20 },
  { name: 'Hot Sauce', category: 'sauce', quantity: 45, price: 30, threshold: 20 },
  
  // Cheese
  { name: 'Mozzarella', category: 'cheese', quantity: 80, price: 50, threshold: 20 },
  { name: 'Cheddar', category: 'cheese', quantity: 70, price: 55, threshold: 20 },
  { name: 'Parmesan', category: 'cheese', quantity: 60, price: 60, threshold: 20 },
  { name: 'Feta', category: 'cheese', quantity: 50, price: 65, threshold: 20 },
  { name: 'Gouda', category: 'cheese', quantity: 45, price: 70, threshold: 20 },
  
  // Veggies
  { name: 'Onions', category: 'veggies', quantity: 100, price: 15, threshold: 30 },
  { name: 'Bell Peppers', category: 'veggies', quantity: 100, price: 20, threshold: 30 },
  { name: 'Mushrooms', category: 'veggies', quantity: 90, price: 25, threshold: 30 },
  { name: 'Tomatoes', category: 'veggies', quantity: 100, price: 15, threshold: 30 },
  { name: 'Olives', category: 'veggies', quantity: 80, price: 20, threshold: 30 },
  { name: 'Jalapenos', category: 'veggies', quantity: 70, price: 20, threshold: 30 },
  { name: 'Corn', category: 'veggies', quantity: 85, price: 15, threshold: 30 },
  { name: 'Spinach', category: 'veggies', quantity: 75, price: 20, threshold: 30 },
  
  // Meat
  { name: 'Pepperoni', category: 'meat', quantity: 60, price: 50, threshold: 20 },
  { name: 'Chicken', category: 'meat', quantity: 55, price: 45, threshold: 20 },
  { name: 'Bacon', category: 'meat', quantity: 50, price: 55, threshold: 20 },
  { name: 'Sausage', category: 'meat', quantity: 50, price: 50, threshold: 20 },
  { name: 'Ham', category: 'meat', quantity: 45, price: 45, threshold: 20 },
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB at', process.env.MONGODB_URI);
    await connectDB();
    // Clear existing data
    await Inventory.deleteMany({});
    await User.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Insert inventory items
    await Inventory.insertMany(inventoryData);
    console.log('Inventory data seeded successfully');
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@pizzaapp.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    console.log('Admin user created:', admin.email);
    
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'user123',
      role: 'user',
      isVerified: true
    });
    console.log('Test user created:', user.email);
    
    console.log('\n=== Seed completed successfully ===');
    console.log('\nLogin credentials:');
    console.log('Admin - Email: admin@pizzaapp.com, Password: admin123');
    console.log('User - Email: user@test.com, Password: user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();

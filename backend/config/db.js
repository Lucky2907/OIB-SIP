const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in environment');
    process.exit(1);
  }
  console.log('[DB] Attempting MongoDB connection to:', uri);
  try {
    await mongoose.connect(uri); // Modern driver no longer needs options
    console.log('[DB] MongoDB connected successfully');
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

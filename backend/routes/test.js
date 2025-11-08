const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');

// Test endpoint to check email configuration
router.get('/email-config', (req, res) => {
  const config = {
    EMAIL_HOST: process.env.EMAIL_HOST || 'NOT SET',
    EMAIL_PORT: process.env.EMAIL_PORT || 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER || 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? '***SET***' : 'NOT SET',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET'
  };

  res.json({
    success: true,
    message: 'Email configuration status',
    config,
    note: 'If values show NOT SET or placeholder values like "your_mailtrap_user", email sending will fail.'
  });
});

// Test database connection and user registration
router.get('/db-status', async (req, res) => {
  try {
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A'
    };

    let userCount = 0;
    let canCreateUser = false;
    let createUserError = null;

    try {
      userCount = await User.countDocuments();
      canCreateUser = true;
    } catch (error) {
      createUserError = error.message;
    }

    res.json({
      success: true,
      database: dbStatus,
      users: {
        count: userCount,
        canQuery: canCreateUser,
        error: createUserError
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test registration endpoint
router.post('/test-register', async (req, res) => {
  try {
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'testpassword123',
      isVerified: true
    };

    const user = await User.create(testUser);

    res.json({
      success: true,
      message: 'Test user created successfully',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

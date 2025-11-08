const express = require('express');
const router = express.Router();

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

module.exports = router;

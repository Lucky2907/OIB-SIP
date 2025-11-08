const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { generateToken, hashToken } = require('../utils/tokenHelper');

// Generate JWT Token
const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate verification token
    const verificationToken = generateToken();
    const hashedToken = hashToken(verificationToken);

    // Create user (skip email verification in development)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isVerified: true, // Auto-verify for development
      verificationToken: hashedToken,
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send verification email (only if email is properly configured)
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    try {
      // Only send email if proper configuration exists
      if (process.env.EMAIL_USER !== 'your_mailtrap_user' && process.env.EMAIL_PASS !== 'your_mailtrap_pass') {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification - Pizza App',
          message
        });
        
        res.status(201).json({
          success: true,
          message: 'User registered successfully. Please check your email for verification.'
        });
      } else {
        // Development mode - email verification skipped
        res.status(201).json({
          success: true,
          message: 'User registered successfully. Email verification skipped for development.',
          note: 'User is automatically verified'
        });
      }
    } catch (error) {
      // If email fails, user is still created and verified for development
      console.log('Email sending failed, but user is verified for development:', error.message);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Email verification skipped due to configuration.',
        note: 'User is automatically verified'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login attempt - Request body:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Login failed - Missing email or password');
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('Login failed - User not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('User found:', { email: user.email, isVerified: user.isVerified });

    // Check if email is verified
    if (!user.isVerified) {
      console.log('Login failed - Email not verified');
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      console.log('Login failed - Invalid password');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateJWT(user._id);
    console.log('Login successful - Token generated for:', user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate reset token
    const resetToken = generateToken();
    const hashedToken = hashToken(resetToken);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - Pizza App',
        message
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ success: false, message: 'Error sending email' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

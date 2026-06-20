const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretaccidentdetectionkey123!', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Debug: log incoming body (mask password)
    const debugBody = { ...req.body };
    if (debugBody.password) debugBody.password = '***';
    console.log('Register payload:', JSON.stringify(debugBody));
    const {
      fullName,
      email,
      password,
      mobileNumber,
      vehicleNumber,
      bloodGroup,
      address,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactMobile,
      emergencyContactEmail,
      role,
      emergencyContacts,
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Build emergency contacts array: prefer full array, else create from individual fields
    const contacts = Array.isArray(emergencyContacts)
      ? emergencyContacts
      : emergencyContactName
      ? [
          {
            name: emergencyContactName,
            relationship: emergencyContactRelationship,
            mobileNumber: emergencyContactMobile,
            email: emergencyContactEmail
          }
        ]
      : [];

    // Create user object
    const user = await User.create({
      fullName,
      email,
      password,
      mobileNumber,
      vehicleNumber,
      bloodGroup,
      address,
      role: role || 'user',
      emergencyContacts: contacts
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate a user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
      user.vehicleNumber = req.body.vehicleNumber || user.vehicleNumber;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.address = req.body.address || user.address;

      if (Array.isArray(req.body.emergencyContacts)) {
        user.emergencyContacts = req.body.emergencyContacts;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          mobileNumber: updatedUser.mobileNumber,
          vehicleNumber: updatedUser.vehicleNumber,
          bloodGroup: updatedUser.bloodGroup,
          address: updatedUser.address,
          role: updatedUser.role,
          emergencyContacts: updatedUser.emergencyContacts
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving users list' });
  }
});

module.exports = router;

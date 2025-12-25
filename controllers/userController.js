const User = require('../models/User');
const Store = require('../models/Store');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @route   POST /api/users
// @access  Private (Main Admin Only)
// Create a new substore admin
exports.createUser = async (req, res, next) => {
  try {
    // Only main admin can create users
    if (req.user.role !== 'MAIN_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can create users',
      });
    }

    const { firstName, lastName, email, storeId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !storeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, and storeId',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    // Cannot assign to main store unless it's admin (handled elsewhere)
    if (store.storeType === 'MAIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign substore admin to main store',
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: tempPassword,
      role: 'SUBSTORE_ADMIN',
      storeId,
      status: 'PENDING',
      isFirstLogin: true,
      createdBy: req.user.id,
    });

    // Send email with temporary credentials
    const resetUrl = `${process.env.FRONTEND_URL}/authentication/reset-password`;
    const message = `
      Welcome to Volt Inventory System!
      
      You have been created as a Substore Admin for ${store.storeName}.
      
      Email: ${email}
      Temporary Password: ${tempPassword}
      
      Please login at: ${resetUrl} and change your password immediately.
      
      Your access has been set to PENDING status. Once you set your password, your account will be automatically activated.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Volt Inventory - Account Created',
        message,
      });
    } catch (err) {
      console.log('Email send error:', err);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Credentials sent to email.',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users
// @access  Private (Main Admin Only)
// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    // Only main admin can view all users
    if (req.user.role !== 'MAIN_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can view all users',
      });
    }

    const users = await User.find()
      .select('-password')
      .populate('storeId', 'storeId storeName')
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/:userId
// @access  Private
// Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('storeId', 'storeId storeName')
      .populate('createdBy', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check access: users can see their own profile, main admin can see all
    if (req.user.role === 'SUBSTORE_ADMIN' && req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this user profile',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/:userId
// @access  Private (Main Admin Only)
// Update user
exports.updateUser = async (req, res, next) => {
  try {
    // Only main admin can update users
    if (req.user.role !== 'MAIN_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can update users',
      });
    }

    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent changing main admin role
    if (user.role === 'MAIN_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify main admin',
      });
    }

    // Update allowed fields
    const { firstName, lastName, status } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/users/:userId
// @access  Private (Main Admin Only)
// Deactivate user
exports.deleteUser = async (req, res, next) => {
  try {
    // Only main admin can delete users
    if (req.user.role !== 'MAIN_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can delete users',
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting main admin
    if (user.role === 'MAIN_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete main admin',
      });
    }

    // Set status to inactive instead of deleting
    user.status = 'INACTIVE';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/store/:storeId
// @access  Private
// Get users for specific store
exports.getUsersByStore = async (req, res, next) => {
  try {
    // Check access
    if (req.user.role === 'SUBSTORE_ADMIN' && req.user.storeId.toString() !== req.params.storeId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this store users',
      });
    }

    const users = await User.find({ storeId: req.params.storeId })
      .select('-password')
      .populate('storeId', 'storeId storeName')
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

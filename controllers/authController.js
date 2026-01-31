const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Store = require('../models/Store');
const Company = require('../models/Company');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token with role and storeId
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      companyId: user.companyId.toString(),
      storeId: user.storeId.toString(),
      isMainAdmin: user.role === 'MAIN_ADMIN',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

// @route   POST /api/auth/register
// @access  Public (first main admin for each company)
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, companyName } = req.body;

    // Validate inputs
    if (!firstName || !lastName || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, password, and companyName',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Check if company already exists
    let company = await Company.findOne({ companyName });
    if (company) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists',
      });
    }

    // Create company
    company = await Company.create({
      companyName,
      companyCode: companyName.substring(0, 3).toUpperCase() + Date.now().toString().slice(-4),
      email: email.toLowerCase(),
      status: 'ACTIVE',
    });

    // Create main store for company
    const mainStore = await Store.create({
      companyId: company._id,
      storeId: 'MS-001',
      storeName: `${companyName} - Main Store`,
      storeType: 'MAIN',
      status: 'ACTIVE',
    });

    // Create main admin user
    user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      companyId: company._id,
      role: 'MAIN_ADMIN',
      storeId: mainStore._id,
      status: 'ACTIVE',
      isFirstLogin: false,
      passwordSetAt: new Date(),
    });

    // Update company with main admin reference
    company.mainAdminId = user._id;
    await company.save();

    // Create token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
        companyId: company._id,
        companyName: company.companyName,
        storeId: user.storeId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check user status
    const userStatus = user.status || 'ACTIVE';
    if (userStatus !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create token
    const token = generateToken(user);

    // Populate for response only (after token generation)
    const populatedUser = await User.findById(user._id)
      .populate('storeId')
      .populate('companyId');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: populatedUser._id,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        email: populatedUser.email,
        role: populatedUser.role,
        imageUrl: populatedUser.imageUrl,
        companyId: populatedUser.companyId._id,
        companyName: populatedUser.companyId.companyName,
        storeId: populatedUser.storeId._id,
        storeName: populatedUser.storeId.storeName,
        isFirstLogin: populatedUser.isFirstLogin,
        defaultCurrency: populatedUser.defaultCurrency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('storeId').populate('companyId');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
        companyId: user.companyId ? {
          _id: user.companyId._id,
          companyName: user.companyId.companyName,
        } : null,
        storeId: user.storeId ? {
          _id: user.storeId._id,
          storeId: user.storeId.storeId,
          storeName: user.storeId.storeName,
          address: user.storeId.address,
          city: user.storeId.city,
          state: user.storeId.state,
          country: user.storeId.country,
          contact: user.storeId.contact,
        } : null,
        defaultCurrency: user.defaultCurrency,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email',
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    // We want to point to the frontend reset password page, not the backend API directly
    const resetUrl = `${process.env.FRONTEND_URL}/authentication/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({
        success: true,
        data: 'Email sent',
      });
    } catch (err) {
      console.error('Email sending failed:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error.message);
    next(error);
  }
};

// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordSetAt = new Date();
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
      user.status = 'ACTIVE';
    }

    await user.save();

    // Create token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        defaultCurrency: user.defaultCurrency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      settings: {
        defaultCurrency: user.defaultCurrency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { firstName, lastName, defaultCurrency, imageUrl } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields (but NOT email)
    if (firstName !== undefined) {
      user.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.lastName = lastName;
    }
    if (defaultCurrency !== undefined) {
      user.defaultCurrency = defaultCurrency;
    }
    if (imageUrl !== undefined) {
      user.imageUrl = imageUrl;
    }

    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .populate('storeId', 'storeId storeName address city state country contact');

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

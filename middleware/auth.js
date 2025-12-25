const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Verify Main Admin role
const verifyMainAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  if (req.user.role !== 'MAIN_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only Main Admin can access this resource',
    });
  }

  next();
};

// Verify Substore Admin role
const verifySubstoreAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  if (req.user.role !== 'SUBSTORE_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only Substore Admin can access this resource',
    });
  }

  next();
};

// Verify access to specific store (Main admin can access any, substore admin only their own)
const verifyStoreAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  const requestedStoreId = req.params.storeId || req.body.storeId;

  if (!requestedStoreId) {
    return res.status(400).json({
      success: false,
      message: 'Store ID is required',
    });
  }

  // Main admin can access any store
  if (req.user.role === 'MAIN_ADMIN') {
    return next();
  }

  // Substore admin can only access their assigned store
  if (req.user.role === 'SUBSTORE_ADMIN') {
    if (req.user.storeId !== requestedStoreId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this store',
      });
    }
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Invalid role',
  });
};

module.exports = { protect, verifyMainAdmin, verifySubstoreAdmin, verifyStoreAccess };

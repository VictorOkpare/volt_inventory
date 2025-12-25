const Store = require('../models/Store');
const User = require('../models/User');

// @route   POST /api/stores
// @access  Private (Main Admin Only)
// Create a new substore
exports.createStore = async (req, res, next) => {
  try {
    // Only main admin can create stores
    if (req.user.role !== 'MAIN_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can create stores',
      });
    }

    const { storeId, storeName, address, city, state, country, contact } = req.body;

    // Validate required fields
    if (!storeId || !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide storeId and storeName',
      });
    }

    // Check if store already exists
    const existingStore = await Store.findOne({ storeId });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'Store with this ID already exists',
      });
    }

    // Get main store as parent
    const mainStore = await Store.findOne({ storeType: 'MAIN' });
    if (!mainStore) {
      return res.status(500).json({
        success: false,
        message: 'Main store not found',
      });
    }

    // Create substore
    const store = await Store.create({
      storeId,
      storeName,
      storeType: 'SUBSTORE',
      parentStoreId: mainStore._id,
      address,
      city,
      state,
      country,
      contact,
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/stores
// @access  Private
// Get all stores (main admin sees all, substore admin sees only their own)
exports.getStores = async (req, res, next) => {
  try {
    let stores;

    if (req.user.role === 'MAIN_ADMIN') {
      // Main admin sees all stores
      stores = await Store.find().populate('parentStoreId');
    } else {
      // Substore admin sees only their own store
      stores = await Store.find({ _id: req.user.storeId }).populate('parentStoreId');
    }

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/stores/:storeId
// @access  Private
// Get single store
exports.getStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.storeId).populate('parentStoreId');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    // Check access
    if (req.user.role === 'SUBSTORE_ADMIN' && store._id.toString() !== req.user.storeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this store',
      });
    }

    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/stores/:storeId
// @access  Private (Main Admin Only)
// Update store
exports.updateStore = async (req, res, next) => {
  try {
    // Only main admin can update stores
    if (req.user.role !== 'MAIN_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can update stores',
      });
    }

    let store = await Store.findById(req.params.storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    // Update allowed fields
    const { storeName, address, city, state, country, contact, status } = req.body;

    if (storeName) store.storeName = storeName;
    if (address) store.address = address;
    if (city) store.city = city;
    if (state) store.state = state;
    if (country) store.country = country;
    if (contact) store.contact = contact;
    if (status) store.status = status;

    await store.save();

    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/stores/:storeId
// @access  Private (Main Admin Only)
// Deactivate store
exports.deleteStore = async (req, res, next) => {
  try {
    // Only main admin can delete stores
    if (req.user.role !== 'MAIN_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only main admin can delete stores',
      });
    }

    const store = await Store.findById(req.params.storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    // Cannot delete main store
    if (store.storeType === 'MAIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete main store',
      });
    }

    // Set status to inactive instead of deleting
    store.status = 'INACTIVE';
    await store.save();

    res.status(200).json({
      success: true,
      message: 'Store deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/stores/:storeId/stats
// @access  Private
// Get store statistics
exports.getStoreStats = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    // Check access
    if (req.user.role === 'SUBSTORE_ADMIN' && store._id.toString() !== req.user.storeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this store',
      });
    }

    // Get basic stats (can be expanded)
    const stats = {
      storeId: store.storeId,
      storeName: store.storeName,
      // Additional stats can be added here
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

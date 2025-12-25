const express = require('express');
const router = express.Router();
const {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
  getStoreStats,
} = require('../controllers/storeController');
const { protect, verifyMainAdmin, verifyStoreAccess } = require('../middleware/auth');

// All store routes require authentication
router.use(protect);

// Create store (main admin only)
router.post('/', verifyMainAdmin, createStore);

// Get all stores
router.get('/', getStores);

// Get stores stats
router.get('/:storeId/stats', verifyStoreAccess, getStoreStats);

// Get single store
router.get('/:storeId', verifyStoreAccess, getStore);

// Update store (main admin only)
router.put('/:storeId', verifyMainAdmin, updateStore);

// Delete store (main admin only)
router.delete('/:storeId', verifyMainAdmin, deleteStore);

module.exports = router;

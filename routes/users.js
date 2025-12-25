const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUsersByStore,
} = require('../controllers/userController');
const { protect, verifyMainAdmin } = require('../middleware/auth');

// All user routes require authentication
router.use(protect);

// Create user (main admin only)
router.post('/', verifyMainAdmin, createUser);

// Get all users (main admin only)
router.get('/', verifyMainAdmin, getUsers);

// Get users by store
router.get('/store/:storeId', getUsersByStore);

// Get single user
router.get('/:userId', getUser);

// Update user (main admin only)
router.put('/:userId', verifyMainAdmin, updateUser);

// Delete user (main admin only)
router.delete('/:userId', verifyMainAdmin, deleteUser);

module.exports = router;

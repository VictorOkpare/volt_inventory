const express = require('express');
const { getItems, getItem, createItem, updateItem, deleteItem, getCategories, updateCategories } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/categories', getCategories);
router.put('/categories', updateCategories);
router.get('/', getItems);
router.post('/', createItem);
router.get('/:id', getItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;

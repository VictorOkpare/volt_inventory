const Inventory = require('../models/Inventory');

// @route   GET /api/inventory/categories
// @access  Private
// @desc    Get all available categories
exports.getCategories = async (req, res, next) => {
  try {
    // Get categories from the schema enum
    const categories = Inventory.schema.path('category').enumValues;

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/inventory
// @access  Private
// @desc    Get all inventory items for logged-in user
exports.getItems = async (req, res, next) => {
  try {
    const items = await Inventory.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/inventory/:id
// @access  Private
// @desc    Get single inventory item
exports.getItem = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check if user owns this item
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this item',
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/inventory
// @access  Private
// @desc    Create new inventory item
exports.createItem = async (req, res, next) => {
  try {
    const { productName, description, category, quantity, unitPrice, sku, imageUrl } = req.body;

    // Validate required fields
    if (!productName || !category || quantity === undefined || !unitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const item = await Inventory.create({
      productName,
      description,
      category,
      quantity,
      unitPrice,
      sku,
      imageUrl,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/inventory/:id
// @access  Private
// @desc    Update inventory item
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check if user owns this item
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item',
      });
    }

    // Update fields
    const { productName, description, category, quantity, unitPrice, sku, imageUrl } = req.body;

    if (productName !== undefined) item.productName = productName;
    if (description !== undefined) item.description = description;
    if (category !== undefined) item.category = category;
    if (quantity !== undefined) item.quantity = quantity;
    if (unitPrice !== undefined) item.unitPrice = unitPrice;
    if (sku !== undefined) item.sku = sku;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;

    await item.save();

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/inventory/:id
// @access  Private
// @desc    Delete inventory item
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check if user owns this item
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

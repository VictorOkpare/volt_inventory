const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: [
        'Electronics',
        'Food',
        'Clothing',
        'Furniture',
        'Books',
        'Toys',
        'Sports',
        'Beauty',
        'Health',
        'Automotive',
        'Home & Garden',
        'Office Supplies',
        'Pet Supplies',
        'Jewelry',
        'Tools',
        'Other'
      ],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Please provide a unit price'],
      min: [0, 'Price cannot be negative'],
    },
    sku: {
      type: String,
      sparse: true, 
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);

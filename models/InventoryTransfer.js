const mongoose = require('mongoose');

const inventoryTransferSchema = new mongoose.Schema(
  {
    transferType: {
      type: String,
      enum: ['PUSH', 'REQUEST', 'RETURN'],
      required: [true, 'Please specify transfer type'],
      // PUSH: Main admin sends items to substore
      // REQUEST: Substore requests items (main admin approves then pushes)
      // RETURN: Substore returns items (main admin approves)
    },
    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Please provide source store'],
    },
    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Please provide destination store'],
    },
    items: [
      {
        inventoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Inventory',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      // PENDING: Awaiting main admin approval (for REQUEST/RETURN)
      // APPROVED: Main admin approved (ready to send)
      // IN_TRANSIT: Items sent, waiting for receipt confirmation
      // RECEIVED: Destination store confirmed receipt
      // REJECTED: Main admin rejected the request/return
      // CANCELLED: Either party cancelled
    },
    reason: {
      type: String,
      trim: true,
      // Why requesting or returning
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // For REQUEST type, the user who requested
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Only main admin can approve
    },
    sentAt: Date,
    receivedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Populate references
inventoryTransferSchema.pre(/^find/, function () {
  this.populate('fromStoreId toStoreId requestedBy approvedBy').populate({
    path: 'items.inventoryId',
    select: 'productName sku category quantity',
  });
});

module.exports = mongoose.model('InventoryTransfer', inventoryTransferSchema);

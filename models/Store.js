const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please assign store to a company'],
    },
    storeId: {
      type: String,
      required: [true, 'Please provide a store ID'],
      uppercase: true,
      trim: true,
      // Format: MS-001 for main, SS-001 for substores (unique per company)
    },
    storeName: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
    },
    storeType: {
      type: String,
      enum: ['MAIN', 'SUBSTORE'],
      required: [true, 'Please specify store type'],
      default: 'SUBSTORE',
    },
    parentStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
      // Only null for MAIN store, points to main store for SUBSTOREs
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    contact: {
      email: {
        type: String,
        lowercase: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email',
        ],
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one MAIN store exists per company
storeSchema.pre('save', async function (next) {
  if (this.storeType === 'MAIN') {
    const existingMain = await mongoose
      .model('Store')
      .findOne({ 
        storeType: 'MAIN', 
        companyId: this.companyId,
        _id: { $ne: this._id } 
      });

    if (existingMain) {
      throw new Error('Only one MAIN store can exist per company');
    }
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);

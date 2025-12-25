const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      unique: true,
      trim: true,
    },
    companyCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      // Auto-generated from first few letters of company name
    },
    email: {
      type: String,
      required: [true, 'Please provide company email'],
      unique: true,
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
    industry: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    mainAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // The main admin who owns this company
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    subscriptionPlan: {
      type: String,
      enum: ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
      default: 'FREE',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);

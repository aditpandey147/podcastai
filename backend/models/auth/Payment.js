// models/Payment.js - Add platform field
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refundDate: {
    type: Date
  },
  purchasedPlanId: {
    type: Number
  },
  purchasedPlanName: {
    type: String
  },
  platform: {
    type: String,
    enum: ['jvzoo', 'launchpad', 'Admin'],
    default: 'jvzoo'
  },
  ipnData: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
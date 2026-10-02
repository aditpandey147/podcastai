// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // ✅ CHANGED: planId is now an array of numbers
  planId: {
    type: [Number],
    default: []
  },
  planName: {
    type: String,
    default: 'Free'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ================================================================
  // ✅ AGENCY FIELDS (NEW — existing fields untouched)
  // ================================================================
  agencyName: {
    type: String,
    default: '',
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  agencyRole: {
    type: String,
    enum: ['owner', 'member', null],
    default: null,
  },
});

userSchema.methods.comparePassword = function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    console.log('❌ Missing password for comparison');
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// ✅ Helper — check if user has a given plan
userSchema.methods.hasPlan = function(planId) {
  const plans = Array.isArray(this.planId) ? this.planId : [this.planId];
  return plans.includes(planId);
};

// ✅ Helper — is this user an agency owner (plan 8)?
userSchema.methods.isAgencyOwner = function() {
  return this.hasPlan(8);
};

module.exports = mongoose.model('User', userSchema);
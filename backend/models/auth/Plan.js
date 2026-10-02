// models/Plan.js - Add launchpad_id field
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const planSchema = new mongoose.Schema({
  planId: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  validity_days: {
    type: Number,
    default: 365
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  // JVZoo specific
  jvzoo_id: {
    type: String,
    default: '',
    index: true
  },
  // LaunchPad specific
  launchpad_id: {
    type: String,
    default: '',
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

planSchema.plugin(AutoIncrement, {
  id: 'plan_id_counter',
  inc_field: 'planId',
  start_seq: 1
});

planSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Plan', planSchema);
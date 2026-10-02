// backend/models/MediaGeneration.js
const mongoose = require('mongoose');

const MediaGenerationSchema = new mongoose.Schema({
  // ================================================================
  // USER
  // ================================================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ================================================================
  // GENERATION DETAILS
  // ================================================================
  generationId: {
    type: String,
    required: true,
    unique: true,
    // ✅ No need for index: true here - unique creates it automatically
  },
  
  type: {
    type: String,
    enum: ['t2i', 't2v', 'i2v', 't2t', 'cover', 'mockup', 'poster'],
    required: true,
    index: true,
  },

  // ================================================================
  // PROMPTS
  // ================================================================
  prompt: {
    type: String,
    required: true,
  },

  // ================================================================
  // FILES
  // ================================================================
  imagePath: {
    type: String,
    default: '',
  },
  videoPath: {
    type: String,
    default: '',
  },

  // ================================================================
  // STATUS
  // ================================================================
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'saved'],
    default: 'pending',
    index: true,
  },
  error: {
    type: String,
    default: null,
  },
  predictionId: {
    type: String,
    default: '',
  },

  // ================================================================
  // METADATA
  // ================================================================
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // ================================================================
  // TIMESTAMPS
  // ================================================================
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,
});

// ================================================================
// ✅ INDEXES - REMOVED duplicate generationId index
// ================================================================
MediaGenerationSchema.index({ userId: 1, createdAt: -1 });
MediaGenerationSchema.index({ userId: 1, type: 1 });
MediaGenerationSchema.index({ status: 1, createdAt: -1 });
// ❌ REMOVED: MediaGenerationSchema.index({ generationId: 1 }, { unique: true });

// ================================================================
// VIRTUAL PROPERTIES
// ================================================================
MediaGenerationSchema.virtual('isComplete').get(function() {
  return this.status === 'completed' || this.status === 'saved';
});

MediaGenerationSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// ================================================================
// INSTANCE METHODS
// ================================================================
MediaGenerationSchema.methods.markProcessing = function() {
  this.status = 'processing';
  this.updatedAt = new Date();
  return this.save();
};

MediaGenerationSchema.methods.markCompleted = function(imagePath) {
  this.status = 'completed';
  this.imagePath = imagePath || this.imagePath;
  this.completedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

MediaGenerationSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  this.updatedAt = new Date();
  return this.save();
};

// ================================================================
// STATIC METHODS
// ================================================================
MediaGenerationSchema.statics.findByUser = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

MediaGenerationSchema.statics.findByType = function(userId, type, limit = 20) {
  return this.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ================================================================
// TO JSON TRANSFORM
// ================================================================
MediaGenerationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

MediaGenerationSchema.set('toObject', {
  virtuals: true,
});

module.exports = mongoose.model('MediaGeneration', MediaGenerationSchema);
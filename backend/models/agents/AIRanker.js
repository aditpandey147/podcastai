// models/AIRanker.js
const mongoose = require('mongoose');

const aiRankerSchema = new mongoose.Schema({
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
  role: {
    type: String,
    required: true
  },
  thinking_pattern: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'seo_audit',
      'keyword_research',
      'content_optimization',
      'link_building',
      'technical_seo',
      'local_seo',
      'ecommerce_seo',
      'rank_tracking',
      'competitor_analysis'
    ],
    required: true
  },
  icon: {
    type: String,
    default: 'fa-chart-line'
  },
  color: {
    type: String,
    default: '#10b981'
  },
  active: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['seo', 'ranking', 'optimization', 'research', 'technical'],
    default: 'seo'
  },
  welcomeMessage: {
    type: String,
    default: "Hello! I'm here to help you improve your website ranking. What would you like to optimize today?"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Method: Increment usage count
aiRankerSchema.methods.incrementUsage = async function() {
  this.usageCount = (this.usageCount || 0) + 1;
  this.updatedAt = new Date();
  return this.save();
};

// ✅ Method: Get summary
aiRankerSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    role: this.role,
    description: this.description,
    icon: this.icon,
    color: this.color,
    category: this.category,
    featured: this.featured,
    usageCount: this.usageCount || 0
  };
};

module.exports = mongoose.model('AIRanker', aiRankerSchema);
// models/AIAgent.js - Add agentType field
const mongoose = require('mongoose');

const aiAgentSchema = new mongoose.Schema({
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
  agentType: {
    type: String,
    enum: ['profit', 'ranker'],
    default: 'profit'
  },
  type: {
    type: String,
    enum: [
      // Profit types
      'digital_marketing',
      'ecommerce',
      'content_creation',
      'email_marketing',
      'advertising',
      'affiliate_marketing',
      'lead_generation',
      'sales',
      'copywriting',
      'professional_services',
      'knowledge_business',
      // Ranker types
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
    default: 'fa-robot'
  },
  color: {
    type: String,
    default: '#3b82f6'
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
    enum: ['profit_generation', 'marketing', 'ecommerce', 'content', 'sales', 'growth', 'seo', 'ranking', 'optimization', 'research', 'technical'],
    default: 'profit_generation'
  },
  welcomeMessage: {
    type: String,
    default: "Hello! I'm here to help you. What would you like to discuss today?"
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
aiAgentSchema.methods.incrementUsage = async function() {
  this.usageCount = (this.usageCount || 0) + 1;
  this.updatedAt = new Date();
  return this.save();
};

// ✅ Method: Update timestamp
aiAgentSchema.methods.updateTimestamp = async function() {
  this.updatedAt = new Date();
  return this.save();
};

// ✅ Method: Get summary
aiAgentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    role: this.role,
    description: this.description,
    icon: this.icon,
    color: this.color,
    category: this.category,
    agentType: this.agentType,
    featured: this.featured,
    usageCount: this.usageCount || 0
  };
};

// ✅ Method: Toggle active status
aiAgentSchema.methods.toggleActive = async function() {
  this.active = !this.active;
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('AIAgent', aiAgentSchema);
// models/AIChat.js
const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIAgent',
    required: true
  },
  agentSlug: {
    type: String,
    required: true
  },
  agentName: {
    type: String,
    required: true
  },
  agentType: {
    type: String,
    enum: ['profit', 'ranker'],
    default: 'profit'
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: {
    type: Array,
    default: []
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
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

// ✅ Index for faster queries
aiChatSchema.index({ userId: 1, agentType: 1 });
aiChatSchema.index({ userId: 1, agentType: 1, lastMessageAt: -1 });

// ✅ Method: Add message
aiChatSchema.methods.addMessage = function(role, content) {
  if (!this.messages) {
    this.messages = [];
  }
  this.messages.push({ 
    role, 
    content, 
    timestamp: new Date() 
  });
  this.messageCount = this.messages.length;
  this.lastMessageAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// ✅ Method: Update timestamps
aiChatSchema.methods.updateTimestamps = function() {
  this.updatedAt = new Date();
  this.lastMessageAt = new Date();
  this.messageCount = this.messages ? this.messages.length : 0;
  return this.save();
};

// Get chat summary
aiChatSchema.methods.getSummary = function() {
  return {
    id: this._id,
    agentName: this.agentName,
    agentSlug: this.agentSlug,
    agentType: this.agentType,
    title: this.title,
    messageCount: this.messageCount || 0,
    lastMessageAt: this.lastMessageAt,
    preview: this.messages && this.messages.length > 0 
      ? this.messages[this.messages.length - 1].content.substring(0, 100) 
      : 'No messages'
  };
};

module.exports = mongoose.model('AIChat', aiChatSchema);
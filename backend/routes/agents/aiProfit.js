// routes/aiProfit.js - Updated to use unified AIChat
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const AIAgent = require('../../models/agents/AIAgent');
const AIChat = require('../../models/agents/AIChat');
const { callAIWithAgent } = require('../../services/aiProfitService');

// ==================== AGENT MANAGEMENT ====================

// Get all active profit agents
router.get('/agents', auth, async (req, res) => {
  try {
    const agents = await AIAgent.find({ 
      active: true,
      agentType: 'profit'
    }).sort({ featured: -1, usageCount: -1 });
    
    res.json({
      success: true,
      agents,
      total: agents.length
    });
  } catch (error) {
    console.error('Error fetching profit agents:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch agents' 
    });
  }
});

// Get agent by slug
router.get('/agents/:slug', auth, async (req, res) => {
  try {
    const agent = await AIAgent.findOne({ 
      slug: req.params.slug,
      active: true,
      agentType: 'profit'
    });
    
    if (!agent) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent not found' 
      });
    }
    
    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch agent' 
    });
  }
});

// ==================== CHAT MANAGEMENT ====================

// Create new profit chat
router.post('/chat/new', auth, async (req, res) => {
  try {
    const { agentSlug } = req.body;
    
    const agent = await AIAgent.findOne({ 
      slug: agentSlug, 
      active: true,
      agentType: 'profit'
    });
    
    if (!agent) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent not found' 
      });
    }

    const chat = new AIChat({
      userId: req.user.id,
      agentId: agent._id,
      agentSlug: agent.slug,
      agentName: agent.name,
      agentType: 'profit',
      title: `Chat with ${agent.name}`,
      messages: []
    });

    await chat.save();

    res.json({
      success: true,
      chat: chat.getSummary()
    });

  } catch (error) {
    console.error('Error creating profit chat:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create chat' 
    });
  }
});

// Get all profit chats for user
router.get('/chats', auth, async (req, res) => {
  try {
    const chats = await AIChat.find({ 
      userId: req.user.id,
      agentType: 'profit',
      isActive: true
    }).sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      chats: chats.map(chat => chat.getSummary())
    });

  } catch (error) {
    console.error('Error fetching profit chats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch chats' 
    });
  }
});

// Get chat by ID (works for both profit and ranker)
router.get('/chat/:chatId', auth, async (req, res) => {
  try {
    const chat = await AIChat.findOne({
      _id: req.params.chatId,
      userId: req.user.id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    const agent = await AIAgent.findOne({ slug: chat.agentSlug });

    res.json({
      success: true,
      chat: {
        id: chat._id,
        agentName: chat.agentName,
        agentSlug: chat.agentSlug,
        agentType: chat.agentType,
        title: chat.title,
        messages: chat.messages,
        messageCount: chat.messageCount,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
        agent: agent ? {
          name: agent.name,
          slug: agent.slug,
          icon: agent.icon,
          color: agent.color,
          role: agent.role
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch chat' 
    });
  }
});

// Send message in chat
router.post('/chat/:chatId', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const { chatId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const chat = await AIChat.findOne({
      _id: chatId,
      userId: req.user.id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    const agent = await AIAgent.findOne({ slug: chat.agentSlug, active: true });
    if (!agent) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent not found' 
      });
    }

    await chat.addMessage('user', message.trim());

    const chatMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Use appropriate service based on agent type
    let aiResponse;
    if (agent.agentType === 'ranker') {
      const { callAIWithRanker } = require('../services/aiRankerService');
      aiResponse = await callAIWithRanker(agent, chatMessages);
    } else {
      const { callAIWithAgent } = require('../services/aiProfitService');
      aiResponse = await callAIWithAgent(agent, chatMessages);
    }

    await chat.addMessage('assistant', aiResponse);
    await agent.incrementUsage();

    res.json({
      success: true,
      response: aiResponse,
      messageCount: chat.messageCount,
      chatId: chat._id,
      agentType: chat.agentType
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    try {
      const chat = await AIChat.findById(req.params.chatId);
      if (chat) {
        await chat.addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
      }
    } catch (e) {
      console.error('Error saving error message:', e);
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to get AI response' 
    });
  }
});

// Update chat title
router.put('/chat/:chatId/title', auth, async (req, res) => {
  try {
    const { title } = req.body;
    const { chatId } = req.params;

    const chat = await AIChat.findOne({
      _id: chatId,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    chat.title = title || 'New Conversation';
    await chat.save();

    res.json({
      success: true,
      chat: chat.getSummary()
    });

  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update chat title' 
    });
  }
});

/// Delete chat - PERMANENT DELETE
router.delete('/chat/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await AIChat.findOne({
      _id: chatId,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    // ✅ PERMANENT DELETE - Remove from database completely
    await AIChat.findByIdAndDelete(chatId);

    res.json({
      success: true,
      message: 'Chat deleted permanently'
    });

  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete chat' 
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin: Create new agent
router.post('/admin/agents', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const agent = new AIAgent(req.body);
    await agent.save();
    
    res.status(201).json({
      success: true,
      agent,
      message: 'Agent created successfully'
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create agent' 
    });
  }
});

// Admin: Update agent
router.put('/admin/agents/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const agent = await AIAgent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!agent) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent not found' 
      });
    }
    
    res.json({
      success: true,
      agent,
      message: 'Agent updated successfully'
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update agent' 
    });
  }
});

// Admin: Delete agent
router.delete('/admin/agents/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const agent = await AIAgent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete agent' 
    });
  }
});

module.exports = router;
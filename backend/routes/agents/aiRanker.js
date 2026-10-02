// routes/aiRanker.js
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const AIAgent = require("../../models/agents/AIAgent");
const AIChat = require("../../models/agents/AIChat");
const { callAIWithRanker } = require("../../services/aiRankerService");

// ==================== AGENT MANAGEMENT ====================

// Get all active ranker agents
router.get("/agents", auth, async (req, res) => {
  try {
    const agents = await AIAgent.find({
      active: true,
      agentType: "ranker",
    }).sort({ featured: -1, usageCount: -1 });

    res.json({
      success: true,
      agents,
      total: agents.length,
    });
  } catch (error) {
    console.error("Error fetching ranker agents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
    });
  }
});

// Get agent by slug
router.get("/agents/:slug", auth, async (req, res) => {
  try {
    const agent = await AIAgent.findOne({
      slug: req.params.slug,
      active: true,
      agentType: "ranker",
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error("Error fetching ranker agent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agent",
    });
  }
});

// ==================== CHAT MANAGEMENT ====================

// Create new ranker chat
router.post("/chat/new", auth, async (req, res) => {
  try {
    const { agentSlug } = req.body;

    const agent = await AIAgent.findOne({
      slug: agentSlug,
      active: true,
      agentType: "ranker",
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    const chat = new AIChat({
      userId: req.user.id,
      agentId: agent._id,
      agentSlug: agent.slug,
      agentName: agent.name,
      agentType: "ranker",
      title: `SEO Chat with ${agent.name}`,
      messages: [],
    });

    await chat.save();

    res.json({
      success: true,
      chat: chat.getSummary(),
    });
  } catch (error) {
    console.error("Error creating ranker chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
});

// Get all ranker chats for user
router.get("/chats", auth, async (req, res) => {
  try {
    const chats = await AIChat.find({
      userId: req.user.id,
      agentType: "ranker",
      isActive: true,
    }).sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      chats: chats.map((chat) => chat.getSummary()),
    });
  } catch (error) {
    console.error("Error fetching ranker chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
});

// Get chat by ID (uses unified GET from aiProfit or separate)
router.get("/chat/:chatId", auth, async (req, res) => {
  try {
    const chat = await AIChat.findOne({
      _id: req.params.chatId,
      userId: req.user.id,
      isActive: true,
      agentType: "ranker",
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Ranker chat not found",
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
        agent: agent
          ? {
              name: agent.name,
              slug: agent.slug,
              icon: agent.icon,
              color: agent.color,
              role: agent.role,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching ranker chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat",
    });
  }
});

// Send message in ranker chat
router.post("/chat/:chatId", auth, async (req, res) => {
  try {
    const { message } = req.body;
    const { chatId } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const chat = await AIChat.findOne({
      _id: chatId,
      userId: req.user.id,
      isActive: true,
      agentType: "ranker",
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const agent = await AIAgent.findOne({ slug: chat.agentSlug, active: true });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    await chat.addMessage("user", message.trim());

    const chatMessages = chat.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const aiResponse = await callAIWithRanker(agent, chatMessages);

    await chat.addMessage("assistant", aiResponse);
    await agent.incrementUsage();

    res.json({
      success: true,
      response: aiResponse,
      messageCount: chat.messageCount,
      chatId: chat._id,
      agentType: chat.agentType,
    });
  } catch (error) {
    console.error("Ranker chat error:", error);

    try {
      const chat = await AIChat.findById(req.params.chatId);
      if (chat) {
        await chat.addMessage(
          "assistant",
          "I apologize, but I encountered an error. Please try again.",
        );
      }
    } catch (e) {
      console.error("Error saving error message:", e);
    }

    res.status(500).json({
      success: false,
      message: "Failed to get AI response",
    });
  }
});

// Update chat title
router.put("/chat/:chatId/title", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const { chatId } = req.params;

    const chat = await AIChat.findOne({
      _id: chatId,
      userId: req.user.id,
      agentType: "ranker",
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    chat.title = title || "New Conversation";
    await chat.save();

    res.json({
      success: true,
      chat: chat.getSummary(),
    });
  } catch (error) {
    console.error("Error updating ranker chat title:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update chat title",
    });
  }
});

// Delete chat - PERMANENT DELETE (FIXED)
router.delete("/chat/:chatId", auth, async (req, res) => {
  try {
    const { chatId } = req.params;


    // ✅ Find the chat first to verify ownership
    const chat = await AIChat.findOne({
      _id: chatId,
      userId: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // ✅ METHOD 1: Use deleteOne() instead of findByIdAndDelete
    const result = await AIChat.deleteOne({ _id: chatId });


    if (result.deletedCount === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete chat",
      });
    }

    // ✅ Verify the chat is actually gone
    const checkChat = await AIChat.findById(chatId);
    if (checkChat) {
      return res.status(500).json({
        success: false,
        message: "Chat was not properly deleted",
      });
    }

    res.json({
      success: true,
      message: "Chat deleted permanently",
      chatId: chatId,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error deleting chat:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete chat",
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin: Create new ranker agent
router.post("/admin/agents", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const agent = new AIAgent({
      ...req.body,
      agentType: "ranker",
    });
    await agent.save();

    res.status(201).json({
      success: true,
      agent,
      message: "Ranker agent created successfully",
    });
  } catch (error) {
    console.error("Error creating ranker agent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create agent",
    });
  }
});

// Admin: Update ranker agent
router.put("/admin/agents/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const agent = await AIAgent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    res.json({
      success: true,
      agent,
      message: "Ranker agent updated successfully",
    });
  } catch (error) {
    console.error("Error updating ranker agent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update agent",
    });
  }
});

// Admin: Delete ranker agent
router.delete("/admin/agents/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const agent = await AIAgent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    res.json({
      success: true,
      message: "Ranker agent deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ranker agent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete agent",
    });
  }
});

module.exports = router;

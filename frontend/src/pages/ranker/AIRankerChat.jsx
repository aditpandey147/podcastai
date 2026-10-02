// pages/ranker/AIRankerChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import {
  Trash2,
  X,
  AlertTriangle,
  MessageSquare,
  History,
  Plus,
  ArrowLeft,
} from "lucide-react";

// ================================================================
// DELETE CONFIRMATION MODAL
// ================================================================
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  chatName,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(2,7,19,.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      ></div>
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        style={{
          background: "linear-gradient(180deg, #06162b, #041124)",
          border: "1px solid #17385f",
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: "rgba(255,95,126,.15)",
            border: "1px solid rgba(255,95,126,.35)",
          }}
        >
          <AlertTriangle size={28} style={{ color: "#ff8fa8" }} />
        </div>
        <h3
          className="text-xl font-bold text-center mb-2"
          style={{ color: "#eaf1ff" }}
        >
          Delete Chat?
        </h3>
        <p
          className="text-sm text-center mb-6"
          style={{ color: "#8fa0ba" }}
        >
          Are you sure you want to delete "
          <strong style={{ color: "#c9b5ff" }}>
            {chatName || "this chat"}
          </strong>
          "? This action cannot be undone and all messages will be permanently
          lost.
        </p>
        <div
          className="rounded-xl p-3 mb-6"
          style={{
            background: "rgba(6,20,42,.7)",
            border: "1px solid #17385f",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(110,53,237,.2)",
                border: "1px solid rgba(150,120,255,.4)",
              }}
            >
              <MessageSquare size={14} style={{ color: "#c9b5ff" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#eaf1ff" }}>
                {chatName || "Chat"}
              </p>
              <p className="text-[10px]" style={{ color: "#7d8fa8" }}>
                This will be permanently deleted
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            style={{
              background: "rgba(6,20,42,.7)",
              border: "1px solid #17385f",
              color: "#aebfd5",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110"
            style={{
              background: "linear-gradient(100deg, #e5395e, #c81c3c)",
            }}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// MAIN COMPONENT
// ================================================================
const AIRankerChat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { user } = useAuth();

  const [chat, setChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deletingChat, setDeletingChat] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      loadChat();
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages, sending]);

  const loadChat = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ai-ranker/chat/${chatId}`);
      if (response.data?.success) {
        setChat(response.data.chat);
        await loadChatHistory(response.data.chat.agentSlug);
      } else {
        toast.error("Chat not found");
        navigate("/ai-ranker");
      }
    } catch (error) {
      console.error("❌ Error loading chat:", error);
      toast.error("Failed to load chat");
      navigate("/ai-ranker");
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (agentSlug) => {
    try {
      const response = await api.get("/ai-ranker/chats");
      if (response.data?.success) {
        const filtered = response.data.chats.filter(
          (chat) => chat.agentSlug === agentSlug && chat.id !== chatId
        );
        setChatHistory(filtered);
      }
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
    }
  };

  const openDeleteModal = (chatItem) => {
    setChatToDelete(chatItem);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    const chatIdToDelete = chatToDelete.id;
    setDeletingChat(chatIdToDelete);

    try {
      await api.delete(`/ai-ranker/chat/${chatIdToDelete}`);
      toast.success("Chat deleted successfully");

      setChatHistory((prev) => prev.filter((c) => c.id !== chatIdToDelete));

      if (chatIdToDelete === chatId) {
        navigate("/ai-ranker");
      }

      setShowDeleteModal(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("❌ Error deleting chat:", error);
      toast.error(error.response?.data?.message || "Failed to delete chat");
    } finally {
      setDeletingChat(null);
    }
  };

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || sending) return;

    const messageToSend = message;
    setInput("");
    setSending(true);

    const tempMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setChat((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...(prev.messages || []), tempMessage],
      };
    });

    try {
      const response = await api.post(`/ai-ranker/chat/${chatId}`, {
        message: messageToSend,
      });

      if (response.data?.success) {
        const updatedChatResponse = await api.get(`/ai-ranker/chat/${chatId}`);
        if (updatedChatResponse.data?.success) {
          setChat(updatedChatResponse.data.chat);
        }
        if (chat?.agentSlug) {
          await loadChatHistory(chat.agentSlug);
        }
      } else {
        toast.error("Failed to send message");
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: (prev.messages || []).filter(
              (m) => m.id !== tempMessage.id
            ),
          };
        });
        setInput(messageToSend);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");

      setChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: (prev.messages || []).filter((m) => m.id !== tempMessage.id),
        };
      });
      setInput(messageToSend);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBack = () => {
    navigate("/ai-ranker");
  };

  const handleSelectChat = (selectedChatId) => {
    if (selectedChatId !== chatId) {
      navigate(`/ai-ranker/chat/${selectedChatId}`);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const chatDate = new Date(date);
    const diff = now - chatDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return chatDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return chatDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return chatDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  // ================================================================
  // FORMAT MESSAGE
  // ================================================================
  const formatMessage = (content) => {
    if (!content) return null;

    const lines = content
      .split("\n")
      .filter((line) => line !== undefined && line !== null);

    return lines.map((line, i) => {
      const lineStr = String(line || "");

      if (lineStr.startsWith("## ")) {
        return (
          <h3
            key={i}
            className="text-base font-bold mt-4 mb-1"
            style={{ color: "#eaf1ff" }}
          >
            {lineStr.slice(3)}
          </h3>
        );
      }
      if (lineStr.startsWith("### ")) {
        return (
          <h4
            key={i}
            className="text-sm font-semibold mt-3 mb-1"
            style={{ color: "#c9b5ff" }}
          >
            {lineStr.slice(4)}
          </h4>
        );
      }

      if (lineStr.includes("**") && !lineStr.includes("```")) {
        const parts = lineStr.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((part, idx) => {
              const partStr = part || "";
              if (idx % 2 === 1) {
                return (
                  <strong key={idx} style={{ color: "#eaf1ff" }}>
                    {partStr}
                  </strong>
                );
              }
              return (
                <span key={idx} style={{ color: "#aebfd5" }}>
                  {partStr}
                </span>
              );
            })}
          </p>
        );
      }

      if (lineStr.startsWith("- ") || lineStr.startsWith("• ")) {
        return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <span style={{ color: "#c9b5ff", marginTop: 6 }}>•</span>
            <span className="text-sm" style={{ color: "#aebfd5" }}>
              {lineStr.slice(2)}
            </span>
          </div>
        );
      }

      if (/^\d+\./.test(lineStr)) {
        const match = lineStr.match(/^(\d+)\./);
        return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <span
              className="text-sm font-medium mt-0.5"
              style={{ color: "#c9b5ff" }}
            >
              {match ? match[1] : ""}.
            </span>
            <span className="text-sm" style={{ color: "#aebfd5" }}>
              {lineStr.replace(/^\d+\.\s*/, "")}
            </span>
          </div>
        );
      }

      if (lineStr.startsWith("```") && lineStr.endsWith("```")) {
        return (
          <div
            key={i}
            className="p-4 rounded-xl my-2 text-xs font-mono overflow-x-auto"
            style={{
              background: "#020713",
              border: "1px solid #17385f",
              color: "#0ce4bd",
            }}
          >
            {lineStr.slice(3, -3)}
          </div>
        );
      }

      if (lineStr.includes("`") && !lineStr.includes("```")) {
        const parts = lineStr.split(/`(.*?)`/g);
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((part, idx) => {
              const partStr = part || "";
              if (idx % 2 === 1) {
                return (
                  <code
                    key={idx}
                    className="px-1.5 py-0.5 rounded text-xs font-mono"
                    style={{
                      background: "rgba(110,53,237,.15)",
                      border: "1px solid rgba(150,120,255,.3)",
                      color: "#c9b5ff",
                    }}
                  >
                    {partStr}
                  </code>
                );
              }
              return (
                <span key={idx} style={{ color: "#aebfd5" }}>
                  {partStr}
                </span>
              );
            })}
          </p>
        );
      }

      if (lineStr.trim() === "") {
        return <br key={i} />;
      }

      return (
        <p key={i} className="text-sm leading-relaxed" style={{ color: "#aebfd5" }}>
          {lineStr}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: "#020914" }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: "4px solid rgba(110,53,237,.15)" }}
              ></div>
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: "4px solid #6e35ed",
                  borderTopColor: "transparent",
                }}
              ></div>
            </div>
            <p className="text-sm" style={{ color: "#8fa0ba" }}>
              Loading conversation...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return null;
  }

  const agent = chat.agent || {
    name: chat.agentName,
    slug: chat.agentSlug,
    icon: "fa-chart-line",
    color: "#6e35ed",
    role: "SEO Specialist",
  };

  const suggestions = [
    "Audit my website for SEO issues",
    "Find high-value keywords for my niche",
    "Optimize my content for search engines",
    "Analyze my competitors' SEO strategy",
    "How to improve my local SEO",
    "Build a link building strategy",
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#020914" }}>
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 flex overflow-hidden gap-0 md:gap-4 p-2 md:p-4">
          {/* Main Chat Area */}
          <div
            className="flex-1 flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(180deg, #06162b, #041124)",
              border: "1px solid #17385f",
              boxShadow: "0 16px 48px rgba(0,0,0,.4)",
            }}
          >
            {/* Header */}
            <div
              className="flex-shrink-0 px-4 md:px-6 py-4"
              style={{ borderBottom: "1px solid #17385f" }}
            >
              <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
                <button
                  onClick={handleBack}
                  className="w-9 h-9 rounded-full transition flex items-center justify-center"
                  style={{ background: "rgba(6,20,42,.6)" }}
                >
                  <ArrowLeft size={18} style={{ color: "#aebfd5" }} />
                </button>

                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: agent.color + "25",
                    border: `1px solid ${agent.color}50`,
                  }}
                >
                  <i
                    className={`fas ${agent.icon} text-lg`}
                    style={{ color: agent.color }}
                  ></i>
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-semibold truncate"
                    style={{ color: "#eaf1ff" }}
                  >
                    {chat.title || chat.agentName}
                  </h3>
                  <p
                    className="text-xs flex items-center gap-1.5"
                    style={{ color: "#8fa0ba" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                      style={{ background: "#0ce4bd", boxShadow: "0 0 8px #0ce4bd" }}
                    ></span>
                    {agent.name} • {agent.role}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-3 py-1 rounded-full hidden sm:inline-block"
                    style={{
                      background: "rgba(6,20,42,.7)",
                      border: "1px solid #17385f",
                      color: "#8fa0ba",
                    }}
                  >
                    {chat.messageCount || 0} messages
                  </span>

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="md:hidden w-9 h-9 rounded-lg transition flex items-center justify-center"
                    style={{ background: "rgba(6,20,42,.6)" }}
                  >
                    <History size={18} style={{ color: "#aebfd5" }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
              <div className="max-w-3xl mx-auto w-full space-y-4">
                {chat.messages && chat.messages.length > 0 ? (
                  chat.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-end gap-3 animate-slideIn ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                      style={{
                        animationDelay: `${idx * 50}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={
                          msg.role === "user"
                            ? {
                                background:
                                  "linear-gradient(135deg, #6e35ed, #3483ff)",
                                boxShadow: "0 4px 12px rgba(110,53,237,.4)",
                              }
                            : {
                                background:
                                  "linear-gradient(135deg, #6e35ed, #3483ff)",
                                boxShadow: "0 4px 12px rgba(110,53,237,.4)",
                              }
                        }
                      >
                        <i
                          className={`fas ${
                            msg.role === "user" ? "fa-user" : agent.icon
                          } text-white text-xs`}
                        ></i>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3`}
                        style={
                          msg.role === "user"
                            ? {
                                background:
                                  "linear-gradient(100deg, #6e35ed, #3483ff)",
                                color: "#ffffff",
                                borderTopRightRadius: 4,
                                boxShadow: "0 4px 14px rgba(110,53,237,.35)",
                              }
                            : {
                                background: "rgba(6,20,42,.75)",
                                border: "1px solid #17385f",
                                borderTopLeftRadius: 4,
                                boxShadow: "0 4px 14px rgba(0,0,0,.35)",
                              }
                        }
                      >
                        {msg.role === "user" ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                            {msg.content}
                          </p>
                        ) : (
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {formatMessage(msg.content)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                      style={{
                        backgroundColor: agent.color + "18",
                        border: `1px solid ${agent.color}40`,
                      }}
                    >
                      <i
                        className={`fas ${agent.icon} text-4xl`}
                        style={{ color: agent.color }}
                      ></i>
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ color: "#eaf1ff" }}
                    >
                      Chat with {agent.name}
                    </h3>
                    <p
                      className="text-sm max-w-md"
                      style={{ color: "#8fa0ba" }}
                    >
                      {agent.description || `Ask me about ${agent.role}`}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput(suggestion);
                            setTimeout(sendMessage, 100);
                          }}
                          className="px-4 py-2 rounded-full text-xs transition"
                          style={{
                            background: "rgba(6,20,42,.7)",
                            border: "1px solid #17385f",
                            color: "#aebfd5",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor =
                              "rgba(150,120,255,.6)";
                            e.currentTarget.style.color = "#c9b5ff";
                            e.currentTarget.style.background =
                              "linear-gradient(100deg, rgba(110,53,237,.2), rgba(52,131,255,.15))";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#17385f";
                            e.currentTarget.style.color = "#aebfd5";
                            e.currentTarget.style.background =
                              "rgba(6,20,42,.7)";
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sending && (
                  <div className="flex items-end gap-3 animate-slideIn">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #6e35ed, #3483ff)",
                        boxShadow: "0 4px 12px rgba(110,53,237,.4)",
                      }}
                    >
                      <i className={`fas ${agent.icon} text-white text-xs`}></i>
                    </div>
                    <div
                      className="rounded-2xl px-5 py-3"
                      style={{
                        background: "rgba(6,20,42,.75)",
                        border: "1px solid #17385f",
                        borderTopLeftRadius: 4,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full animate-bounce"
                              style={{
                                background: "#c9b5ff",
                                animationDelay: `${i * 0.15}s`,
                              }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-xs" style={{ color: "#8fa0ba" }}>
                          Analyzing SEO...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div
              className="flex-shrink-0 px-4 md:px-6 py-4"
              style={{ borderTop: "1px solid #17385f" }}
            >
              <div className="max-w-3xl mx-auto w-full">
                <div
                  className="flex items-end gap-2 rounded-2xl p-1.5 transition-all duration-200"
                  style={{
                    background: "rgba(6,20,42,.55)",
                    border: "2px solid #17385f",
                  }}
                  onFocusCapture={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(150,120,255,.6)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(110,53,237,.12)";
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = "#17385f";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask ${agent.name} about SEO...`}
                    disabled={sending}
                    rows={1}
                    className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none resize-none text-sm disabled:opacity-50 min-h-[40px] max-h-[200px]"
                    style={{ color: "#eaf1ff", caretColor: "#c9b5ff" }}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-9 h-9 rounded-full text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #6e35ed, #3483ff)",
                      boxShadow: "0 4px 14px rgba(110,53,237,.4)",
                    }}
                  >
                    {sending ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <i className="fas fa-paper-plane text-sm transform -rotate-12"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat History */}
          <div
            className={`
              fixed md:relative inset-y-0 right-0 w-80 md:w-72 lg:w-80 
              transform transition-transform duration-300 ease-in-out
              ${showHistory ? "translate-x-0" : "translate-x-full md:translate-x-0"}
              md:block flex-shrink-0 rounded-2xl overflow-hidden
              z-30 md:z-auto
            `}
            style={{
              background: "linear-gradient(180deg, #06162b, #041124)",
              border: "1px solid #17385f",
              boxShadow: "0 16px 48px rgba(0,0,0,.4)",
            }}
          >
            <button
              onClick={() => setShowHistory(false)}
              className="md:hidden absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "#041124",
                border: "1px solid #17385f",
              }}
            >
              <X size={18} style={{ color: "#aebfd5" }} />
            </button>

            <div className="flex flex-col h-full">
              {/* History Header */}
              <div
                className="flex-shrink-0 px-4 py-4"
                style={{ borderBottom: "1px solid #17385f" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #6e35ed, #3483ff)",
                      boxShadow: "0 4px 12px rgba(110,53,237,.4)",
                    }}
                  >
                    <History size={16} className="text-white" />
                  </div>
                  <div>
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: "#eaf1ff" }}
                    >
                      SEO Chat History
                    </h4>
                    <p className="text-[10px]" style={{ color: "#7d8fa8" }}>
                      {chatHistory.length} conversations with {agent.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto px-2 py-3">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{
                        background: "rgba(6,20,42,.7)",
                        border: "1px solid #17385f",
                      }}
                    >
                      <MessageSquare size={24} style={{ color: "#7d8fa8" }} />
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#8fa0ba" }}
                    >
                      No previous chats
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#7d8fa8" }}>
                      Start a new SEO conversation
                    </p>
                  </div>
                ) : (
                  chatHistory.map((chatItem) => {
                    const itemId = chatItem.id || chatItem._id;
                    const isActive = itemId === chatId;
                    return (
                      <div
                        key={itemId}
                        className="group relative px-3 py-2.5 rounded-xl transition-all duration-200 flex items-start gap-3 mb-1"
                        style={{
                          background: isActive
                            ? "linear-gradient(100deg, rgba(110,53,237,.2), rgba(52,131,255,.12))"
                            : "transparent",
                          border: isActive
                            ? "1px solid rgba(150,120,255,.5)"
                            : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background =
                              "rgba(80,150,255,.06)";
                            e.currentTarget.style.borderColor =
                              "rgba(80,150,255,.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                          }
                        }}
                      >
                        <button
                          onClick={() => handleSelectChat(itemId)}
                          className="flex-1 flex items-start gap-3 min-w-0 text-left"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: "rgba(6,20,42,.8)",
                              border: "1px solid rgba(150,120,255,.3)",
                            }}
                          >
                            <i
                              className={`fas ${agent.icon} text-xs`}
                              style={{ color: "#c9b5ff" }}
                            ></i>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-sm font-medium truncate"
                                style={{
                                  color: isActive ? "#c9b5ff" : "#eaf1ff",
                                }}
                              >
                                {chatItem.title || chatItem.agentName}
                              </span>
                              <span
                                className="text-[10px] whitespace-nowrap ml-2"
                                style={{ color: "#7d8fa8" }}
                              >
                                {formatDate(chatItem.lastMessageAt)}
                              </span>
                            </div>
                            <p
                              className="text-xs truncate mt-0.5"
                              style={{ color: "#7d8fa8" }}
                            >
                              {chatItem.preview ||
                                `${chatItem.messageCount || 0} messages`}
                            </p>
                          </div>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteModal(chatItem)}
                          disabled={deletingChat === itemId}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                          style={{ color: "#7d8fa8" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#ff8fa8";
                            e.currentTarget.style.background =
                              "rgba(255,95,126,.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#7d8fa8";
                            e.currentTarget.style.background = "transparent";
                          }}
                          title="Delete chat"
                        >
                          {deletingChat === itemId ? (
                            <div
                              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: "#ff8fa8" }}
                            ></div>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* New Chat Button */}
              <div
                className="flex-shrink-0 px-4 py-3"
                style={{ borderTop: "1px solid #17385f" }}
              >
                <button
                  onClick={() => navigate("/ai-ranker")}
                  className="w-full px-4 py-2.5 text-white text-sm font-medium rounded-xl transition flex items-center justify-center gap-2 hover:brightness-110"
                  style={{
                    background: "linear-gradient(100deg, #6e35ed, #3483ff)",
                    boxShadow: "0 6px 18px rgba(110,53,237,.35)",
                  }}
                >
                  <Plus size={16} />
                  New SEO Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setChatToDelete(null);
        }}
        onConfirm={confirmDelete}
        chatName={chatToDelete?.title || chatToDelete?.agentName}
        isDeleting={!!deletingChat}
      />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.35s ease-out forwards;
        }
        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }
        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: zoom-in-95 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AIRankerChat;

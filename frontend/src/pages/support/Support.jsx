// frontend/src/pages/support/Support.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
  Search,
  HelpCircle,
  Key,
  Lock,
  User,
  LogIn,
  Shield,
  Copy,
  ExternalLink,
  Headphones,
  Clock,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  BookOpen,
  CheckCircle,
  Sparkles,
  Mic2,
  Radio,
  Palette,
  TrendingUp,
  Film,
  Infinity as InfinityIcon,
  Crown,
  Building2,
} from "lucide-react";

const Support = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("credentials");

  const APP_URL =
    import.meta.env.VITE_APP_URL || "https://podcastai.albinolabs.com";
  const SUPPORT_DESK_URL = "https://supportalbinolabs.tawk.help/";

  const userCredentials = {
    appUrl: APP_URL,
    loginEmail: user?.email || "Your purchase email",
    defaultPassword: user?.email || "Your purchase email (default password)",
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(label);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const loginFaqs = [
    {
      id: 1,
      question: "What is my login email?",
      answer:
        "Your login email is the email address you used to purchase PodcastAI. This is the email where you received your purchase confirmation and login credentials.",
      icon: "📧",
    },
    {
      id: 2,
      question: "What is my default password?",
      answer:
        "Your default password is exactly the same as your purchase email. For example, if you purchased with 'john@example.com', your default password is also 'john@example.com'. We recommend changing this after your first login for security.",
      icon: "🔑",
    },
    {
      id: 3,
      question: "How do I login to my account?",
      answer:
        "1. Go to podcastai.albinolabs.com\n2. Enter your purchase email as your login email\n3. Enter your purchase email as your password (same as login email)\n4. Click 'Login' to access your dashboard",
      icon: "🎙️",
    },
    {
      id: 4,
      question: "I forgot my password. What should I do?",
      answer:
        "If you've forgotten your password, click the 'Forgot Password' link on the login page. Enter your purchase email, and we'll send you a password reset link. You can then create a new password.",
      icon: "🔄",
    },
    {
      id: 5,
      question: "Can I change my password?",
      answer:
        "Yes! Once logged in, go to Settings > Security > Change Password. Enter your current password and your new password. Make sure to save your new password in a safe place.",
      icon: "🔐",
    },
    {
      id: 6,
      question: "Why is my password the same as my email?",
      answer:
        "For security and convenience, we automatically set your password to match your purchase email. This ensures you can login immediately after purchase. You can change this anytime from your settings.",
      icon: "💡",
    },
    {
      id: 7,
      question: "How do I add team members to my Agency plan?",
      answer:
        "If you have the Agency plan, go to the Agency page in the sidebar. Click 'Add Member' and enter their name, email, and a password. They'll instantly get access to your subscription — no separate billing required.",
      icon: "🏢",
    },
    {
      id: 8,
      question: "I'm having trouble logging in. What should I do?",
      answer:
        "If you're having trouble logging in, try these steps:\n1. Make sure you're using the correct email (the one you purchased with)\n2. Your password is the same as your email (case sensitive)\n3. Clear your browser cache and cookies\n4. Try a different browser or device\n5. If still having issues, contact our support team via Support Ticket or email.",
      icon: "🆘",
    },
  ];

  const tabs = [
    { id: "credentials", label: "Login Credentials", icon: Key },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "help", label: "Help Topics", icon: BookOpen },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = loginFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#020914" }}>
      <div className="flex-1 ml-0  flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* ===== HERO ===== */}
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(110,53,237,.15), transparent 40%), radial-gradient(circle at 100% 100%, rgba(52,131,255,.12), transparent 40%), linear-gradient(135deg, #06162b 0%, #041124 100%)",
                border: "1px solid rgba(80,150,255,.25)",
                boxShadow:
                  "0 22px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset",
              }}
            >
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
                style={{ background: "rgba(110,53,237,.08)" }}
              />
              <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
                style={{ background: "rgba(52,131,255,.08)" }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  {/* Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                    style={{
                      background: "rgba(110,53,237,.15)",
                      border: "1px solid rgba(150,120,255,.4)",
                      color: "#c9b5ff",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: "#0ce4bd",
                        boxShadow: "0 0 12px #0ce4bd",
                      }}
                    />
                    24/7 Support Available
                  </div>

                  <h1 className="text-4xl md:text-5xl font-bold text-[#eaf1ff] mb-4 leading-tight">
                    How can we{" "}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, #b65bff, #7855ff, #338dff)",
                        WebkitBackgroundClip: "text",
                      }}
                    >
                      support
                    </span>{" "}
                    you?
                  </h1>

                  <p className="text-lg text-[#aebfd5] max-w-2xl">
                    Get instant answers, find solutions, and connect with our
                    support team.
                  </p>

                  {/* Search */}
                  <div className="max-w-xl mt-6">
                    <div
                      className="relative rounded-2xl"
                      style={{
                        background: "rgba(6,34,74,.55)",
                        border: "1px solid #17385f",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <div className="flex items-center px-5">
                        <Search size={20} className="text-[#7d8fa8]" />
                        <input
                          type="text"
                          placeholder="Search for help..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-3 text-[#eaf1ff] bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-[#7d8fa8] text-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-[#7d8fa8] hover:text-white transition"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-end gap-4">
                  {[
                    { value: "24/7", label: "Support Available" },
                    { value: "100%", label: "Satisfaction Rate" },
                    { value: "5★", label: "User Rating" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 text-center min-w-[110px]"
                      style={{
                        background: "rgba(6,34,74,.55)",
                        border: "1px solid rgba(150,120,255,.3)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <div className="text-3xl font-bold text-[#c9b5ff]">
                        {s.value}
                      </div>
                      <div className="text-xs text-[#8fa0ba] mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== TWO COLUMN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===== LEFT COLUMN - Tabs ===== */}
              <div className="lg:col-span-1">
                <div
                  className="rounded-2xl p-4 sticky top-4"
                  style={{
                    background: "#06162b",
                    border: "1px solid #17385f",
                    boxShadow: "0 4px 20px rgba(0,0,0,.35)",
                  }}
                >
                  <h3 className="text-sm font-semibold text-[#8fa0ba] uppercase tracking-wider mb-4 px-2">
                    Support Topics
                  </h3>

                  <div className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                          style={
                            isActive
                              ? {
                                  background:
                                    "linear-gradient(100deg, #6e35ed, #3483ff)",
                                  color: "#ffffff",
                                  boxShadow:
                                    "0 8px 24px rgba(110,53,237,.35)",
                                }
                              : {
                                  color: "#aebfd5",
                                }
                          }
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background =
                                "rgba(80,150,255,.08)";
                              e.currentTarget.style.color = "#eaf1ff";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#aebfd5";
                            }
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: isActive
                                ? "rgba(255,255,255,.15)"
                                : "rgba(6,20,42,.7)",
                              border: isActive
                                ? "1px solid rgba(255,255,255,.2)"
                                : "1px solid rgba(80,150,255,.25)",
                            }}
                          >
                            <Icon
                              size={16}
                              style={{
                                color: isActive ? "#ffffff" : "#c9b5ff",
                              }}
                            />
                          </div>
                          <span className="flex-1 text-left">{tab.label}</span>
                          {isActive && (
                            <div
                              className="w-1.5 h-6 rounded-full"
                              style={{ background: "rgba(255,255,255,.6)" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Contact */}
                  <div
                    className="mt-6 pt-6"
                    style={{ borderTop: "1px solid #17385f" }}
                  >
                    <h4 className="text-xs font-medium text-[#8fa0ba] uppercase tracking-wider mb-3">
                      Quick Contact
                    </h4>
                    <a
                      href={SUPPORT_DESK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                      style={{
                        background: "rgba(110,53,237,.15)",
                        color: "#c9b5ff",
                        border: "1px solid rgba(150,120,255,.35)",
                      }}
                    >
                      <MessageCircle size={18} />
                      Support
                      <ExternalLink
                        size={14}
                        className="ml-auto text-[#7d8fa8]"
                      />
                    </a>
                  </div>

                  {/* Support Hours */}
                  <div
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(110,53,237,.15), rgba(52,131,255,.1))",
                      border: "1px solid rgba(150,120,255,.35)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-[#c9b5ff]" />
                      <span className="text-sm font-semibold text-[#eaf1ff]">
                        Support Hours
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-[#8fa0ba]">
                      <p>Mon-Fri: 9:00 AM - 9:00 PM EST</p>
                      <p>Sat-Sun: 10:00 AM - 6:00 PM EST</p>
                      <p className="text-[#0ce4bd] font-medium mt-1">
                        ⚡ Average response: &lt; 2 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN - Content ===== */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "#06162b",
                    border: "1px solid #17385f",
                    boxShadow: "0 4px 20px rgba(0,0,0,.35)",
                  }}
                >
                  {/* ===== CREDENTIALS TAB ===== */}
                  {activeTab === "credentials" && (
                    <div>
                      <div
                        className="px-6 py-5"
                        style={{
                          background:
                            "linear-gradient(100deg, #6e35ed, #3483ff)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,.2)" }}
                          >
                            <Key size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              Login Credentials
                            </h2>
                            <p className="text-white/80 text-sm">
                              Use these credentials to login to your account
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Email */}
                          <div
                            className="rounded-xl p-5 transition"
                            style={{
                              background: "rgba(6,20,42,.6)",
                              border: "1px solid #17385f",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-[#8fa0ba] font-medium uppercase tracking-wider flex items-center gap-2">
                                  <User size={14} className="text-[#8fa0ba]" />
                                  Login Email
                                </p>
                                <p className="text-base font-bold text-[#eaf1ff] mt-2 font-mono break-all">
                                  {userCredentials.loginEmail}
                                </p>
                                <p className="text-xs text-[#7d8fa8] mt-1">
                                  Your purchase email is your login email
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    userCredentials.loginEmail,
                                    "Login Email"
                                  )
                                }
                                className="p-2.5 rounded-xl transition"
                                style={{
                                  color: "#7d8fa8",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#c9b5ff";
                                  e.currentTarget.style.background =
                                    "rgba(110,53,237,.15)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "#7d8fa8";
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          <div
                            className="rounded-xl p-5 transition"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(110,53,237,.12), rgba(52,131,255,.08))",
                              border: "1px solid rgba(150,120,255,.35)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-[#8fa0ba] font-medium uppercase tracking-wider flex items-center gap-2">
                                  <Lock size={14} className="text-[#8fa0ba]" />
                                  Default Password
                                </p>
                                <p className="text-base font-bold text-[#eaf1ff] mt-2 font-mono break-all">
                                  {userCredentials.defaultPassword}
                                </p>
                                <p className="text-xs text-[#c9b5ff] mt-1">
                                  ⚠️ Your purchase email is your default password
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    userCredentials.defaultPassword,
                                    "Default Password"
                                  )
                                }
                                className="p-2.5 rounded-xl transition"
                                style={{ color: "#7d8fa8" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#c9b5ff";
                                  e.currentTarget.style.background =
                                    "rgba(110,53,237,.15)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "#7d8fa8";
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* How to Login */}
                          <div
                            className="rounded-xl p-5"
                            style={{
                              background: "rgba(6,20,42,.5)",
                              border: "1px solid #17385f",
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  background: "rgba(110,53,237,.2)",
                                  border: "1px solid rgba(150,120,255,.4)",
                                }}
                              >
                                <LogIn size={16} className="text-[#c9b5ff]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#eaf1ff]">
                                  How to Login
                                </p>
                                <ol className="text-sm text-[#aebfd5] mt-2 space-y-1.5 list-decimal list-inside">
                                  <li>
                                    Go to{" "}
                                    <strong className="text-[#c9b5ff]">
                                      {userCredentials.appUrl}
                                    </strong>
                                  </li>
                                  <li>
                                    Enter your <strong>Login Email</strong>
                                  </li>
                                  <li>
                                    Enter your <strong>Default Password</strong>
                                  </li>
                                  <li>
                                    Click <strong>Login</strong> to access your
                                    dashboard
                                  </li>
                                </ol>
                              </div>
                            </div>
                          </div>

                          {/* Security Tip */}
                          <div
                            className="rounded-xl p-5"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(110,53,237,.12), rgba(52,131,255,.08))",
                              border: "1px solid rgba(150,120,255,.35)",
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  background: "rgba(110,53,237,.25)",
                                  border: "1px solid rgba(150,120,255,.4)",
                                }}
                              >
                                <Shield size={16} className="text-[#c9b5ff]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#eaf1ff]">
                                  Security Tip
                                </p>
                                <p className="text-sm text-[#aebfd5] mt-2 leading-relaxed">
                                  For better security, we recommend changing your
                                  password after first login. Go to{" "}
                                  <strong className="text-[#c9b5ff]">
                                    Settings → Security → Change Password
                                  </strong>
                                  .
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== FAQ TAB ===== */}
                  {activeTab === "faq" && (
                    <div>
                      <div
                        className="px-6 py-5"
                        style={{
                          background:
                            "linear-gradient(100deg, #6e35ed, #3483ff)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,.2)" }}
                          >
                            <HelpCircle size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              Frequently Asked Questions
                            </h2>
                            <p className="text-white/80 text-sm">
                              Common questions about logging into your account
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {filteredFaqs.length > 0 ? (
                          <div className="space-y-3">
                            {filteredFaqs.map((faq) => {
                              const isOpen = expandedFaq === faq.id;
                              return (
                                <div
                                  key={faq.id}
                                  className="rounded-xl overflow-hidden transition-all duration-200"
                                  style={{
                                    background: isOpen
                                      ? "linear-gradient(135deg, rgba(110,53,237,.12), rgba(52,131,255,.08))"
                                      : "rgba(6,20,42,.5)",
                                    border: isOpen
                                      ? "1px solid rgba(150,120,255,.5)"
                                      : "1px solid #17385f",
                                    boxShadow: isOpen
                                      ? "0 8px 24px rgba(0,0,0,.35)"
                                      : "none",
                                  }}
                                >
                                  <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full px-5 py-4 text-left flex items-start gap-3 transition"
                                  >
                                    <span className="text-2xl mt-0.5 shrink-0">
                                      {faq.icon}
                                    </span>
                                    <span className="text-sm font-medium text-[#eaf1ff] pr-4 flex-1">
                                      {faq.question}
                                    </span>
                                    <span
                                      className="transition-transform duration-300 shrink-0 mt-1"
                                      style={{
                                        transform: isOpen
                                          ? "rotate(180deg)"
                                          : "rotate(0)",
                                        color: isOpen ? "#c9b5ff" : "#7d8fa8",
                                      }}
                                    >
                                      <ChevronDown size={18} />
                                    </span>
                                  </button>

                                  {isOpen && (
                                    <div
                                      className="px-5 pb-4 pt-0"
                                      style={{
                                        borderTop: "1px solid #17385f",
                                      }}
                                    >
                                      <p className="text-sm text-[#aebfd5] leading-relaxed whitespace-pre-line pt-4">
                                        {faq.answer}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-[#8fa0ba]">
                              No results found for "
                              <strong className="text-[#c9b5ff]">
                                {searchQuery}
                              </strong>
                              "
                            </p>
                            <button
                              onClick={() => setSearchQuery("")}
                              className="mt-3 text-sm font-medium transition"
                              style={{ color: "#c9b5ff" }}
                            >
                              Clear search
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== HELP TOPICS TAB ===== */}
                  {activeTab === "help" && (
                    <div>
                      <div
                        className="px-6 py-5"
                        style={{
                          background:
                            "linear-gradient(100deg, #6e35ed, #3483ff)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,.2)" }}
                          >
                            <BookOpen size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              Help Topics
                            </h2>
                            <p className="text-white/80 text-sm">
                              Browse through our help articles and guides
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              icon: Mic2,
                              title: "Podcast Creation",
                              desc: "Create stunning AI-powered podcast videos",
                            },
                            {
                              icon: Sparkles,
                              title: "AI Dialogue",
                              desc: "Generate natural host & guest dialogues",
                            },
                            {
                              icon: Palette,
                              title: "Branding Suite",
                              desc: "Build a complete brand identity with AI",
                            },
                            {
                              icon: TrendingUp,
                              title: "Growth Studio",
                              desc: "Grow your podcast with AI insights",
                            },
                            {
                              icon: Film,
                              title: "Viral Shorts AI",
                              desc: "Turn episodes into viral short clips",
                            },
                            {
                              icon: Building2,
                              title: "Agency Management",
                              desc: "Add team members and share your plan",
                            },
                          ].map((topic, i) => {
                            const Icon = topic.icon;
                            return (
                              <div
                                key={i}
                                className="p-4 rounded-xl transition cursor-pointer"
                                style={{
                                  background: "rgba(6,20,42,.5)",
                                  border: "1px solid #17385f",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "linear-gradient(135deg, rgba(110,53,237,.12), rgba(52,131,255,.08))";
                                  e.currentTarget.style.borderColor =
                                    "rgba(150,120,255,.5)";
                                  e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(6,20,42,.5)";
                                  e.currentTarget.style.borderColor = "#17385f";
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                      background: "rgba(110,53,237,.2)",
                                      border:
                                        "1px solid rgba(150,120,255,.4)",
                                    }}
                                  >
                                    <Icon
                                      size={18}
                                      className="text-[#c9b5ff]"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-[#eaf1ff]">
                                      {topic.title}
                                    </h4>
                                    <p className="text-xs text-[#8fa0ba] mt-1">
                                      {topic.desc}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== CTA ===== */}
                <div
                  className="mt-6 relative overflow-hidden rounded-2xl p-8 text-center"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(110,53,237,.15), transparent 60%), linear-gradient(135deg, #06162b 0%, #041124 100%)",
                    border: "1px solid rgba(150,120,255,.4)",
                    boxShadow:
                      "0 22px 70px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.03) inset",
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl"
                    style={{ background: "rgba(110,53,237,.15)" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl"
                    style={{ background: "rgba(52,131,255,.15)" }}
                  />

                  <div className="relative z-10">
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background: "rgba(110,53,237,.2)",
                        border: "1px solid rgba(150,120,255,.5)",
                      }}
                    >
                      <MessageCircle size={28} className="text-[#c9b5ff]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#eaf1ff] mb-3">
                      Still Need Help?
                    </h3>
                    <p className="text-[#8fa0ba] mb-6 max-w-md mx-auto">
                      Our support team is ready to assist you with any questions.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <a
                        href={SUPPORT_DESK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
                        style={{
                          background:
                            "linear-gradient(100deg, #6e35ed, #3483ff)",
                          boxShadow: "0 8px 24px rgba(110,53,237,.4)",
                        }}
                      >
                        <MessageCircle size={18} />
                        Contact Support
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;
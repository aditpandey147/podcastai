// frontend/src/pages/Subscription.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Crown, CheckCircle, Calendar, CreditCard, Package, Sparkles, Zap,
  Shield, TrendingUp, Users, Rocket, Settings, Headphones, Check,
  ArrowRight, Clock, XCircle, RefreshCw, AlertCircle, ChevronRight,
  Tag, Hash, CalendarDays, Info, Eye, Download, Share2, ExternalLink,
  Layers, BadgeCheck,
} from "lucide-react";

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.get("/subscription/my-subscription");
      if (response.data?.success) {
        setSubscription(response.data.data);
        console.log("📋 Subscription data:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD",
    }).format(amount || 0);
  };

  const getPlanIcon = (planId) => {
    const icons = { 1: "🆓", 2: "🚀", 3: "⚡", 4: "💎", 5: "👑", 10: "🤖" };
    return icons[planId] || "📦";
  };

  // Color per planId (dark-tinted version)
  const getPlanColor = (planId) => {
    const colors = {
      1: { bg: "rgba(80,150,255,.12)", border: "rgba(80,150,255,.35)" },
      2: { bg: "rgba(80,150,255,.15)", border: "rgba(80,150,255,.4)" },
      3: { bg: "rgba(110,53,237,.15)", border: "rgba(110,53,237,.4)" },
      4: { bg: "rgba(150,120,255,.15)", border: "rgba(150,120,255,.4)" },
      5: { bg: "rgba(255,207,112,.15)", border: "rgba(255,207,112,.4)" },
      10: { bg: "rgba(255,95,126,.15)", border: "rgba(255,95,126,.4)" },
    };
    return colors[planId] || colors[1];
  };

  const getPlanDisplayName = (plan) => {
    return plan?.name || `Plan ${plan?.planId || 1}`;
  };

  // Status colors (dark-tinted)
  const getStatusColor = (status) => {
    const colors = {
      active: { bg: "rgba(12,228,189,.15)", border: "rgba(12,228,189,.35)", fg: "#0ce4bd" },
      cancelled: { bg: "rgba(255,95,126,.15)", border: "rgba(255,95,126,.35)", fg: "#ff8fa8" },
      refunded: { bg: "rgba(255,207,112,.15)", border: "rgba(255,207,112,.35)", fg: "#ffcf70" },
      pending: { bg: "rgba(80,150,255,.15)", border: "rgba(80,150,255,.35)", fg: "#6ddcff" },
    };
    return colors[status] || colors.active;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle size={12} style={{ color: "#0ce4bd" }} />,
      cancelled: <XCircle size={12} style={{ color: "#ff8fa8" }} />,
      refunded: <RefreshCw size={12} style={{ color: "#ffcf70" }} />,
      pending: <Clock size={12} style={{ color: "#6ddcff" }} />,
    };
    return icons[status] || icons.active;
  };

  const getStatusMessage = (status) => {
    const messages = {
      active: "This plan is currently providing access to your account.",
      cancelled: "This plan has been cancelled and is no longer active.",
      refunded: "This plan has been refunded.",
      pending: "This plan is pending activation.",
    };
    return messages[status] || messages.active;
  };

  const totalSubscriptions = subscription?.allPlans?.length || 0;
  const activeSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "active").length || 0;
  const cancelledSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "cancelled").length || 0;
  const refundedSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "refunded").length || 0;

  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: "#020914" }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: "rgba(110,53,237,.2)" }}></div>
                <div className="absolute inset-0 border-4 rounded-full animate-spin" style={{ borderColor: "#6e35ed", borderTopColor: "transparent" }}></div>
              </div>
              <p className="text-sm font-medium" style={{ color: "#8fa0ba" }}>
                Loading your subscriptions...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex h-screen" style={{ background: "#020914" }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: "#06162b", border: "1px solid #17385f" }}>
                <Package size={36} style={{ color: "#7d8fa8" }} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#eaf1ff" }}>
                No Subscriptions Found
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#8fa0ba" }}>
                You don't have any active subscriptions. Choose a plan to get started.
              </p>
              <button
                onClick={() => navigate("/upgrades")}
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:brightness-110"
                style={{ background: "linear-gradient(100deg, #6e35ed, #3483ff)", boxShadow: "0 8px 24px rgba(110,53,237,.35)" }}
              >
                View Plans
                <ArrowRight size={16} />
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { user: userInfo, currentPlan, allPlans, payments, totalPurchased, isActive } = subscription;

  return (
    <div className="flex h-screen" style={{ background: "#020914" }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#eaf1ff" }}>
                  My Subscriptions
                </h1>
                <p className="text-sm mt-1" style={{ color: "#8fa0ba" }}>
                  View all plans connected to your account and their current status.
                </p>
              </div>
              <a
                href="https://www.aidigitalproduct.live/upgrades"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:border-[#6e35ed]/50"
                style={{ background: "#06162b", border: "1px solid #17385f", color: "#eaf1ff" }}
              >
                <Layers size={15} style={{ color: "#c9b5ff" }} />
                Compare Plans
              </a>
            </div>

            {/* ===== CURRENT PLAN HERO ===== */}
            {currentPlan && (
              <div
                className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6"
                style={{
                  background: "radial-gradient(circle at 90% 10%, rgba(110,53,237,.25), transparent 55%), linear-gradient(105deg, #06162b 0%, #041124 100%)",
                  border: "1px solid rgba(150,120,255,.35)",
                  boxShadow: "0 20px 50px -15px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03) inset",
                }}
              >
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -mr-24 -mt-24" style={{ background: "rgba(110,53,237,.15)" }}></div>
                <div
                  className="absolute inset-0 opacity-[.04]"
                  style={{
                    backgroundImage: "linear-gradient(#b65bff 1px, transparent 1px), linear-gradient(90deg, #b65bff 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                ></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: "rgba(110,53,237,.15)", border: "1px solid rgba(150,120,255,.35)" }}>
                      {getPlanIcon(currentPlan.planId)}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#c9b5ff" }}>
                        <BadgeCheck size={12} />
                        Current Plan
                      </div>
                      <h2 className="text-2xl font-bold" style={{ color: "#eaf1ff" }}>
                        {getPlanDisplayName(currentPlan)}
                      </h2>
                      <p className="text-sm mt-1" style={{ color: "#8fa0ba" }}>
                        {isActive ? "Active and providing access to your account" : "Not currently active"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-8 md:pl-6 md:border-l" style={{ borderColor: "rgba(150,120,255,.2)" }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "#7d8fa8" }}>
                        Total Purchased
                      </p>
                      <p className="text-xl font-bold tabular-nums" style={{ color: "#eaf1ff" }}>
                        {formatCurrency(totalPurchased)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "#7d8fa8" }}>
                        Status
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          isActive
                            ? { background: "rgba(12,228,189,.15)", color: "#0ce4bd", border: "1px solid rgba(12,228,189,.35)" }
                            : { background: "rgba(80,150,255,.12)", color: "#aebfd5", border: "1px solid rgba(80,150,255,.3)" }
                        }
                      >
                        {isActive ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5" style={{ background: "#06162b", border: "1px solid #17385f" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(80,150,255,.12)", border: "1px solid rgba(80,150,255,.3)" }}>
                    <Package size={14} style={{ color: "#6ddcff" }} />
                  </span>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "#eaf1ff" }}>
                  {totalSubscriptions}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#8fa0ba" }}>
                  Total Subscriptions
                </p>
              </div>

              <div className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5 relative overflow-hidden" style={{ background: "#06162b", border: "1px solid rgba(12,228,189,.3)" }}>
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl" style={{ background: "rgba(12,228,189,.15)" }}></div>
                <div className="relative flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(12,228,189,.12)", border: "1px solid rgba(12,228,189,.3)" }}>
                    <CheckCircle size={14} style={{ color: "#0ce4bd" }} />
                  </span>
                </div>
                <p className="relative text-2xl font-bold tabular-nums" style={{ color: "#0ce4bd" }}>
                  {activeSubscriptions}
                </p>
                <p className="relative text-xs font-medium mt-0.5" style={{ color: "#8fa0ba" }}>
                  Active
                </p>
              </div>

              <div className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5" style={{ background: "#06162b", border: "1px solid #17385f" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,95,126,.12)", border: "1px solid rgba(255,95,126,.3)" }}>
                    <XCircle size={14} style={{ color: "#ff8fa8" }} />
                  </span>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "#ff8fa8" }}>
                  {cancelledSubscriptions}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#8fa0ba" }}>
                  Cancelled
                </p>
              </div>

              <div className="rounded-xl p-4 shadow-sm transition-all hover:-translate-y-0.5" style={{ background: "#06162b", border: "1px solid #17385f" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,207,112,.12)", border: "1px solid rgba(255,207,112,.3)" }}>
                    <RefreshCw size={14} style={{ color: "#ffcf70" }} />
                  </span>
                </div>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "#ffcf70" }}>
                  {refundedSubscriptions}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#8fa0ba" }}>
                  Refunded
                </p>
              </div>
            </div>

            {/* ===== SUBSCRIPTION LIST ===== */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#eaf1ff" }}>
                Plan History
              </h2>
              <span className="text-xs" style={{ color: "#8fa0ba" }}>
                {totalSubscriptions} total
              </span>
            </div>

            <div className="space-y-4">
              {allPlans && allPlans.length > 0 ? (
                allPlans.map((plan, index) => {
                  const statusColor = getStatusColor(plan.status);
                  const statusIcon = getStatusIcon(plan.status);
                  const statusMessage = getStatusMessage(plan.status);
                  const planIcon = getPlanIcon(plan.planId);
                  const planName = getPlanDisplayName(plan);
                  const planColor = getPlanColor(plan.planId);
                  const isCurrent = plan.planId === currentPlan?.planId;

                  const startDate = plan.purchaseDate || plan.createdAt || new Date();
                  const endDate = plan.expiryDate || new Date(new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000);

                  const source = plan.source || "Launchpad";
                  const transactionId = plan.transactionId || `TXN-${String(plan.planId).padStart(4, "0")}-${String(Date.now() + index).slice(-6)}`;

                  return (
                    <div
                      key={plan.planId}
                      className="rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={
                        isCurrent
                          ? { background: "linear-gradient(180deg, #071a33, #06162b)", border: "1.5px solid rgba(150,120,255,.55)", boxShadow: "0 0 0 4px rgba(110,53,237,.15), 0 10px 30px rgba(0,0,0,.4)" }
                          : { background: "#06162b", border: "1px solid #17385f", opacity: 0.95 }
                      }
                    >
                      {/* ===== PLAN HEADER ===== */}
                      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #17385f" }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: planColor.bg, border: `1px solid ${planColor.border}` }}
                          >
                            {planIcon}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "#eaf1ff" }}>
                              {planName}
                              {isCurrent && (
                                <span
                                  className="px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1"
                                  style={{ background: "linear-gradient(100deg, #6e35ed, #3483ff)", color: "#fff", boxShadow: "0 2px 8px rgba(110,53,237,.4)" }}
                                >
                                  <Zap size={10} className="fill-current" />
                                  Current
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <p className="text-xs flex items-center gap-1" style={{ color: "#8fa0ba" }}>
                                <Hash size={10} /> Plan ID: {plan.planId}
                              </p>
                              <span className="w-1 h-1 rounded-full" style={{ background: "#17385f" }}></span>
                              <p className="text-xs flex items-center gap-1" style={{ color: "#8fa0ba" }}>
                                <Package size={10} /> {plan.validityDays || 365} days
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                            style={{ background: statusColor.bg, border: `1px solid ${statusColor.border}`, color: statusColor.fg }}
                          >
                            {statusIcon}
                            {plan.status || "Active"}
                          </span>
                        </div>
                      </div>

                      {/* ===== PLAN DETAILS ===== */}
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column - Dates */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: "rgba(6,20,42,.6)", border: "1px solid rgba(80,150,255,.12)" }}>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,207,112,.12)", border: "1px solid rgba(255,207,112,.3)" }}>
                                <Calendar size={13} style={{ color: "#ffcf70" }} />
                              </div>
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#7d8fa8" }}>Started</p>
                                <p className="text-xs font-medium" style={{ color: "#eaf1ff" }}>{formatDate(startDate)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: "rgba(6,20,42,.6)", border: "1px solid rgba(80,150,255,.12)" }}>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(12,228,189,.12)", border: "1px solid rgba(12,228,189,.3)" }}>
                                <CalendarDays size={13} style={{ color: "#0ce4bd" }} />
                              </div>
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#7d8fa8" }}>Valid Until</p>
                                <p className="text-xs font-medium" style={{ color: "#eaf1ff" }}>{formatDate(endDate)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Source & Transaction */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: "rgba(6,20,42,.6)", border: "1px solid rgba(80,150,255,.12)" }}>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(150,120,255,.12)", border: "1px solid rgba(150,120,255,.3)" }}>
                                <Tag size={13} style={{ color: "#c9b5ff" }} />
                              </div>
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#7d8fa8" }}>Source</p>
                                <p className="text-xs font-medium" style={{ color: "#eaf1ff" }}>{source}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: "rgba(6,20,42,.6)", border: "1px solid rgba(80,150,255,.12)" }}>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,207,112,.12)", border: "1px solid rgba(255,207,112,.3)" }}>
                                <Hash size={13} style={{ color: "#ffcf70" }} />
                              </div>
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#7d8fa8" }}>Transaction</p>
                                <p className="text-xs font-medium font-mono" style={{ color: "#eaf1ff" }}>{transactionId}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ===== STATUS MESSAGE ===== */}
                        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #17385f" }}>
                          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(6,20,42,.7)", border: "1px solid rgba(80,150,255,.2)" }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(80,150,255,.15)", border: "1px solid rgba(80,150,255,.3)" }}>
                              <Info size={13} style={{ color: "#6ddcff" }} />
                            </div>
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#7d8fa8" }}>Status Message</p>
                              <p className="text-xs leading-relaxed" style={{ color: "#aebfd5" }}>{statusMessage}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl p-12 text-center" style={{ background: "#06162b", border: "1px solid #17385f" }}>
                  <Package size={48} className="mx-auto mb-4" style={{ color: "#7d8fa8", opacity: 0.3 }} />
                  <p className="text-sm" style={{ color: "#8fa0ba" }}>No subscriptions found</p>
                </div>
              )}
            </div>

            {/* ===== FOOTER ===== */}
            <div className="mt-8 flex items-center justify-center gap-2 text-center">
              <Headphones size={14} style={{ color: "#c9b5ff" }} />
              <p className="text-xs" style={{ color: "#8fa0ba" }}>
                Need help with your subscriptions?{" "}
                <a href="/support" className="font-medium hover:underline" style={{ color: "#c9b5ff" }}>
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Subscription;
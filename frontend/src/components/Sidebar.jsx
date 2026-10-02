// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeatures } from "../hooks/useFeatures";   // 👈 NEW
import logo from "../assets/nav-logo.png";
import api from "../services/api";
import {
  LayoutDashboard,
  Plus,
  Box,
  Crown,
  ChartLine,
  Images,
  Video,
  DollarSign,
  GraduationCap,
  Rocket,
  Headset,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  FolderOpen,
  Gift,
  Lightbulb,
  LayoutGrid,
  Film,
  Flame,
  Infinity as InfinityIcon,
  TrendingUp,
  Palette,
  Building2,
  Package,
  BarChart3,
} from "lucide-react";

// ================================================================
// WAVE LOGO
// ================================================================
function WaveLogo() {
  const heights = [17, 27, 38, 27, 17];
  return (
    <div className="flex items-center gap-[3px]" style={{ width: 42 }}>
      {heights.map((h, i) => (
        <i
          key={i}
          style={{
            display: "block",
            width: 5,
            height: h,
            borderRadius: 9,
            background: "linear-gradient(#39a4ff, #7544ee)",
            boxShadow: "0 0 10px rgba(49,94,255,.4)",
          }}
        />
      ))}
    </div>
  );
}

const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const { has } = useFeatures();   // 👈 NEW — feature flags
  const navigate = useNavigate();
  const [planName, setPlanName] = useState(user?.planName || "Free");
  const [planLoading, setPlanLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const fetchPlanName = async () => {
      if (!user?.planId) return;
      try {
        setPlanLoading(true);
        const response = await api.get("/plans");
        if (response.data && response.data.length > 0) {
          const planIds = user.planId || [1];
          const highestPlanId = Math.max(...planIds);
          const plan = response.data.find((p) => p.planId === highestPlanId);
          if (plan) {
            setPlanName(plan.name);
          } else {
            setPlanName(user?.planName || "Free");
          }
        }
      } catch (error) {
        console.error("Failed to fetch plan name:", error);
        setPlanName(user?.planName || "Free");
      } finally {
        setPlanLoading(false);
      }
    };
    fetchPlanName();
  }, [user?.planId]);

  // ================================================================
  // NAV ITEMS — feature-flag based (no plan IDs)
  // ================================================================
  const navItems = [
    // ---- Free ----
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      path: "/trending-podcasts",
      label: "Trending Podcasts",
      icon: Flame,
      show: true,
    },
    {
      path: "/ai-dialogue",
      label: "AI Dialogue",
      icon: Sparkles,
      show: true,
    },
    {
      path: "/templates",
      label: "Templates",
      icon: LayoutGrid,
      show: true,
    },
    {
      path: "/my-podcasts",
      label: "My Podcasts",
      icon: Film,
      show: true,
    },

    // ---- Feature-gated ----
    {
      path: "/unlimited",
      icon: InfinityIcon,
      label: "Unlimited",
      show: has("unlimited"),
    },
    {
      path: "/podcast-creator-pro",
      label: "Podcast Creator Pro",
      icon: Crown,
      show: has("podcastCreatorPro"),
    },
    {
      path: "/viral-shorts-ai",
      label: "Viral Shorts AI",
      icon: Sparkles,
      show: has("viralShortsAI"),
    },
    {
      path: "/podcast-growth-studio",
      label: "Podcast Growth Studio",
      icon: TrendingUp,
      show: has("growthStudio"),
    },
    {
      path: "/branding-suite",
      label: "Branding Suite",
      icon: Palette,
      show: has("brandingSuite"),
    },
    {
      path: "/dfy-podcast-pack",
      label: "DFY Podcast Pack",
      icon: Package,
      show: has("dfy"),
    },
    { path: "/ai-ranker",
      label: "AI Ranker", 
      icon: BarChart3, 
      show: has("aiRanker") },
    {
      path: "/agency",
      label: "Agency",
      icon: Building2,
      show: has("agency"),
    },
    {
      path: "/reseller",
      label: "Reseller",
      icon: Gift,
      show: has("reseller"),
    },

    // ---- Always visible ----
    {
      path: "/training",
      icon: GraduationCap,
      label: "Training",
      show: true,
      target: "_blank",
    },
    {
      path: "/upgrades",
      icon: Rocket,
      label: "Upgrades",
      show: true,
      target: "_blank",
      external: true,
      href: "https://www.aidigitalproduct.live/upgrades",
    },
    {
      path: "/support",
      icon: Headset,
      label: "Support",
      show: true,
      target: "_blank",
    },
  ];

  const adminNavItem = {
    path: "/admin/dashboard",
    label: "Admin Panel",
    icon: Shield,
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  // ================================================================
  // PLAN BADGE
  // ================================================================
  const getPlanColor = (planName) => {
    const planColors = {
      Free: "bg-slate-700/50 text-slate-300 border border-slate-600/50",
      FE: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
      "FE + TURBO":
        "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40",
      "Unlimited Silver":
        "bg-slate-600/40 text-slate-200 border border-slate-500/40",
      "Unlimited Gold":
        "bg-amber-500/20 text-amber-300 border border-amber-500/40",
      "Cover Design Suite":
        "bg-purple-500/20 text-purple-300 border border-purple-500/40",
      "AI Sales Machine Silver":
        "bg-purple-500/25 text-purple-200 border border-purple-500/50",
      "AI Sales Machine Gold":
        "bg-purple-500/30 text-purple-200 border border-purple-400/50",
      "DFY Silver": "bg-slate-600/40 text-slate-200 border border-slate-500/40",
      "DFY Gold":
        "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
      "AI Ranker":
        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
      "AI Profit Macker Lite":
        "bg-rose-500/20 text-rose-300 border border-rose-500/40",
      "AI Profit Macker Pro":
        "bg-rose-500/25 text-rose-200 border border-rose-500/50",
      RESELLER: "bg-amber-500/25 text-amber-200 border border-amber-500/50",
    };
    return (
      planColors[planName] ||
      "bg-slate-700/50 text-slate-300 border border-slate-600/50"
    );
  };

  const getPlanIcon = (planName) => {
    const planIcons = {
      Free: "fa-box",
      FE: "fa-rocket",
      "FE + TURBO": "fa-bolt",
      "Unlimited Silver": "fa-infinity",
      "Unlimited Gold": "fa-crown",
      "Cover Design Suite": "fa-palette",
      "AI Sales Machine Silver": "fa-robot",
      "AI Sales Machine Gold": "fa-robot",
      "DFY Silver": "fa-wrench",
      "DFY Gold": "fa-wrench",
      "AI Ranker": "fa-chart-line",
      "AI Profit Macker Lite": "fa-money-bill-wave",
      "AI Profit Macker Pro": "fa-money-bill-wave",
      RESELLER: "fa-gift",
    };
    return planIcons[planName] || "fa-box";
  };

  const visibleNavItems = navItems.filter((item) => item.show);
  const isExternalLink = (item) => item.external === true;

  // ================================================================
  // SIDEBAR COLORS
  // ================================================================
  const sidebarBg = "linear-gradient(#031020, #020916)";
  const sidebarBorder = "#10294a";
  const navDefaultText = "#b7c9df";
  const navHoverBg = "#0a1a32";
  const navActiveBg = "linear-gradient(100deg, #6b38ed, #344fff)";
  const navActiveShadow = "0 8px 24px rgba(69,54,233,.2)";
  const dividerColor = "#102b4c";
  const proCardBg = "#05152b";
  const proCardBorder = "#173b67";

  return (
    <>
      {/* ✅ Mobile Hamburger */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl"
        style={{
          background: sidebarBg,
          border: `1px solid ${sidebarBorder}`,
          boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        }}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X size={22} style={{ color: "#edf4ff" }} />
        ) : (
          <Menu size={22} style={{ color: "#edf4ff" }} />
        )}
      </button>

      {/* ✅ Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
          onClick={closeMobileSidebar}
        />
      )}

      {/* ✅ Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          hidden md:flex md:flex-col md:w-72 h-screen fixed left-0 top-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          zIndex: 10,
        }}
      >
        {/* ============ LOGO ============ */}
        <div className="border-b border-[#153c6d] flex justify-center py-3">
          <img src={logo} alt="Podcast AI" className="object-contain py-2 " />
        </div>

        {/* ============ NAVIGATION ============ */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: "18px 16px" }}
        >
          {/* Admin Panel */}
          {user?.role === "admin" && (
            <NavLink
              to={adminNavItem.path}
              className="flex items-center transition-colors duration-150"
              style={({ isActive }) => ({
                height: 46,
                margin: "4px 0",
                padding: "0 13px",
                gap: 14,
                borderRadius: 9,
                fontSize: 16,
                textDecoration: "none",
                background: isActive ? navActiveBg : "transparent",
                color: isActive ? "#ffffff" : navDefaultText,
                boxShadow: isActive ? navActiveShadow : "none",
              })}
            >
              {({ isActive }) => (
                <>
                  <Shield size={14} strokeWidth={1.8} />
                  <span className="font-medium">{adminNavItem.label}</span>
                </>
              )}
            </NavLink>
          )}

          {/* Main Nav */}
          <div>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              if (isExternalLink(item)) {
                return (
                  <a
                    key={item.path}
                    href={item.href}
                    target={item.target || "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center transition-colors duration-150"
                    style={{
                      height: 46,
                      margin: "4px 0",
                      padding: "0 13px",
                      gap: 14,
                      borderRadius: 9,
                      fontSize: 16,
                      color: navDefaultText,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = navHoverBg;
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = navDefaultText;
                    }}
                  >
                    <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className="flex items-center transition-colors duration-150"
                  style={({ isActive }) => ({
                    height: 46,
                    margin: "4px 0",
                    padding: "0 13px",
                    gap: 14,
                    borderRadius: 9,
                    fontSize: 15,
                    textDecoration: "none",
                    background: isActive ? navActiveBg : "transparent",
                    color: isActive ? "#ffffff" : navDefaultText,
                    boxShadow: isActive ? navActiveShadow : "none",
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.background = navHoverBg;
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.getAttribute("aria-current")) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = navDefaultText;
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ============ USER (compact, dropdown) ============ */}
        <div
          style={{
            padding: "0 16px 16px",
            flexShrink: 0,
            borderTop: `1px solid ${dividerColor}`,
          }}
        >
          <div
            className="relative flex items-center cursor-pointer transition"
            onClick={toggleDropdown}
            style={{
              marginTop: 12,
              padding: "6px 6px",
              borderRadius: 9,
            }}
            onMouseEnter={(e) => {
              if (!isDropdownOpen)
                e.currentTarget.style.background = navHoverBg;
            }}
            onMouseLeave={(e) => {
              if (!isDropdownOpen)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <div className="relative shrink-0">
              <div
                className="flex items-center justify-center overflow-hidden rounded-full"
                style={{
                  width: 34,
                  height: 34,
                  background:
                    "linear-gradient(135deg, rgba(108,54,237,.45), rgba(52,119,255,.45))",
                  border: "1px solid #48617f",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#edf4ff",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <span
                className="absolute rounded-full"
                style={{
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  background: "#22c55e",
                  border: `2px solid #020916`,
                }}
              />
            </div>

            <div className="ml-2.5 flex-1 min-w-0">
              <div
                className="truncate"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#edf4ff",
                }}
              >
                {user?.name || "User"}
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                {planLoading ? (
                  <span style={{ fontSize: 9, color: "#64748b" }}>
                    Loading...
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 truncate"
                    style={{
                      fontSize: 9,
                      color: "#9ab0cc",
                    }}
                  >
                    {planName?.replace(/^Complyzo\s+/, "") || "Free"}
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={14}
              style={{
                color: "#9ab0cc",
                transition: "transform .2s",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                flexShrink: 0,
              }}
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-3 right-3 rounded-xl overflow-hidden animate-slide-up z-50"
              style={{
                bottom: 80,
                background: "#05152b",
                border: `1px solid ${proCardBorder}`,
                boxShadow: "0 20px 60px rgba(0,0,0,.55)",
              }}
            >
              <div style={{ padding: 6 }}>
                <NavLink
                  to="/settings"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: navDefaultText,
                  }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </NavLink>

                <NavLink
                  to="/subscription"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: navDefaultText,
                  }}
                >
                  <Crown size={16} />
                  <span>Subscription</span>
                </NavLink>

                <NavLink
                  to="/support"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: navDefaultText,
                  }}
                >
                  <Headset size={16} />
                  <span>Support</span>
                </NavLink>

                <div
                  style={{
                    height: 1,
                    background: dividerColor,
                    margin: "4px 0",
                  }}
                />

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileSidebar();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg"
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#f87171",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          background: "rgba(3,16,32,.95)",
          borderTop: `1px solid ${sidebarBorder}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="flex justify-around items-center"
          style={{ padding: "6px 8px" }}
        >
          {visibleNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            if (isExternalLink(item)) {
              return (
                <a
                  key={item.path}
                  href={item.href}
                  target={item.target || "_blank"}
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                  style={{
                    padding: "6px 8px",
                    borderRadius: 12,
                    minWidth: 50,
                    color: "#64748b",
                    textDecoration: "none",
                  }}
                >
                  <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                </a>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center"
                style={({ isActive }) => ({
                  padding: "6px 8px",
                  borderRadius: 12,
                  minWidth: 50,
                  color: isActive ? "#ffffff" : "#64748b",
                  background: isActive ? navActiveBg : "transparent",
                  boxShadow: isActive ? navActiveShadow : "none",
                  textDecoration: "none",
                })}
              >
                <Icon size={20} strokeWidth={1.8} className="shrink-0" />
              </NavLink>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px) scale(.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slide-up .2s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in .25s ease-out forwards;
        }
        aside nav::-webkit-scrollbar { width: 6px; }
        aside nav::-webkit-scrollbar-track { background: transparent; }
        aside nav::-webkit-scrollbar-thumb {
          background: rgba(72,97,127,.4);
          border-radius: 3px;
        }
        aside nav::-webkit-scrollbar-thumb:hover {
          background: rgba(72,97,127,.7);
        }
      `}</style>
    </>
  );
};

export default Sidebar;

// App.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AIProfitProvider } from "./context/AIProfitContext";
import PrivateRoute from "./components/features/PrivateRoute";
import FeatureRoute from "./components/features/FeatureRoute";   // 👈 NEW
import HomeNavbar from "./components/HomeNavbar";
import Footer from "./components/Footer";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Subscription from "./pages/auth/Subscription";

// Pages
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import CreateProduct from "./pages/CreateProduct";
import MyPodcasts from "./pages/MyPodcasts";
import AIDialogue from "./pages/AIDialogue";
import TrendingPodcasts from "./pages/TrendingPodcasts";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

// Agency
import Agency from "./pages/agency/Agency";

import VisualLibraryPage from "./components/dfy/VisualLibraryPage";
import VideoLibraryPage from "./components/dfy/VideoLibraryPage";

// OTOs
import Unlimited from "./pages/otos/Unlimited";
import PodcastCreatorPro from "./pages/otos/PodcastCreatorPro";
import ViralShortsAI from "./pages/otos/ViralShortsAI";
import PodcastGrowthStudio from "./pages/otos/PodcastGrowthStudio";
import BrandingSuite from "./pages/otos/BrandingSuite";
import Reseller from "./pages/otos/Reseller";
import AIRanker from "./pages/ranker/AIRanker";
import AIRankerChat from "./pages/ranker/AIRankerChat";

// Support
import Training from "./pages/support/Training";
import Support from "./pages/support/Support";
import Settings from "./pages/Settings";

// 👇 NEW
import UpgradeRequired from "./pages/features/UpgradeRequired";

// ================================================================
// Layout — unchanged
// ================================================================
const Layout = ({ children }) => {
  const location = useLocation();

  const dashboardPages = [
    "/dashboard",
    "/templates",
    "/create-podcast",
    "/trending-podcasts",
    "/my-podcasts",
    "/ai-dialogue",
    "/podcast-creator-pro",
    "/admin/dashboard",
    "/unlimited",
    "/viral-shorts-ai",
    "/podcast-growth-studio",
    "/branding-suite",
    "/dfy-podcast-pack",
    "/training",
    "/support",
    "/ai-ranker",
    "/settings",
    "/subscription",
    "/reseller",
    "/agency",
    "/upgrade-required",   // 👈 NEW — dashboard-style (has Sidebar)
  ];

  const isDashboardPage =
    dashboardPages.includes(location.pathname) ||
    location.pathname.startsWith("/ai-profit-machine/chat/") ||
    location.pathname.startsWith("/ai-ranker/chat/") ||
    location.pathname.startsWith("/products/") ||
    location.pathname.startsWith("/templates/");

  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage =
    authPages.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  return (
    <>
      {!isDashboardPage && !isAuthPage && <HomeNavbar />}
      <div className={!isDashboardPage && !isAuthPage ? "pt-14" : ""}>
        {children}
      </div>
      {!isDashboardPage && !isAuthPage && <Footer />}
    </>
  );
};

// ================================================================
// App
// ================================================================
function App() {
  return (
    <AuthProvider>
      <AIProfitProvider>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ==================== Auth Routes ==================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/support" element={<Support />} />

            {/* ==================== Admin ==================== */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* ==================== Free Routes (auth only) ==================== */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/ai-dialogue"
              element={
                <PrivateRoute>
                  <AIDialogue />
                </PrivateRoute>
              }
            />

            <Route
              path="/templates"
              element={
                <PrivateRoute>
                  <Templates />
                </PrivateRoute>
              }
            />

            <Route
              path="/create-podcast"
              element={
                <PrivateRoute>
                  <CreateProduct />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-podcasts"
              element={
                <PrivateRoute>
                  <MyPodcasts />
                </PrivateRoute>
              }
            />

            <Route
              path="/trending-podcasts"
              element={
                <PrivateRoute>
                  <TrendingPodcasts />
                </PrivateRoute>
              }
            />

            {/* ==================== Feature-Gated Routes ==================== */}
            <Route
              path="/unlimited"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="unlimited">
                    <Unlimited />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/dfy-podcast-pack"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="dfy">
                    <VideoLibraryPage
                      apiKey={
                        import.meta.env.VITE_PEXELS_API_KEY ||
                        "YOUR_PEXELS_API_KEY"
                      }
                      defaultQuery="Technology"
                      perPage={12}
                    />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/podcast-creator-pro"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="podcastCreatorPro">
                    <PodcastCreatorPro />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/viral-shorts-ai"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="viralShortsAI">
                    <ViralShortsAI />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/podcast-growth-studio"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="growthStudio">
                    <PodcastGrowthStudio />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/branding-suite"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="brandingSuite">
                    <BrandingSuite />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/ai-ranker"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="ranker">
                   <AIRanker />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-ranker/chat/:chatId"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="ranker">
                   <AIRankerChat />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/agency"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="agency">
                    <Agency />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/reseller"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="reseller">
                    <Reseller />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ==================== Other Protected ==================== */}
            <Route
              path="/subscription"
              element={
                <PrivateRoute>
                  <Subscription />
                </PrivateRoute>
              }
            />

            <Route
              path="/training"
              element={
                <PrivateRoute>
                  <Training />
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />

            {/* ==================== Upgrade Required Fallback ==================== */}
            <Route
              path="/upgrade-required"
              element={
                <PrivateRoute>
                  <UpgradeRequired />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AIProfitProvider>
    </AuthProvider>
  );
}

export default App;

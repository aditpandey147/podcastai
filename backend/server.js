// backend/src/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

dotenv.config();

// ================================================================
// ROUTES
// ================================================================
const authRoutes = require("./routes/auth/auth");
const jvzooRoutes = require("./routes/auth/jvzoo");
const passwordResetRoutes = require("./routes/auth/passwordReset");
const planRoutes = require("./routes/auth/plans");
const aiProfitRoutes = require("./routes/agents/aiProfit");
const aiRankerRoutes = require("./routes/agents/aiRanker");
const subscriptionRoutes = require("./routes/auth/subscriptionRoutes");
const adminRoutes = require("./routes/auth/admin");
const agencyRoutes = require('./routes/agency/agencyRoutes');

//page routes
const categoryRoutes = require("./routes/categoryRoutes");
const templateRoutes = require("./routes/templateRoutes"); 
  // ✅ NEW

// ================================================================
// STATIC FILE HEADERS — lets images load cross-origin
// ================================================================
const setStaticHeaders = (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Length, Content-Disposition"
  );
  next();
};

// ================================================================
// APP + CORS
// ================================================================
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL, // optional production URL
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ================================================================
// SECURITY — Helmet with CSP tuned for cross-origin images
// ================================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // let our manual headers handle it
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================================
// SESSION + PASSPORT
// ================================================================
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ================================================================
// 📁 STATIC FILES — only mounted ONCE each
// ================================================================
// Temp downloads
app.use("/files", express.static(path.join(__dirname, "temp")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Uploaded files (categories, templates, products...) — with CORS headers + cache
app.use(
  "/uploads",
  setStaticHeaders,
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
    etag: true,
    setHeaders: (res) => {
      // Also set on each response (belt + suspenders)
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Public images
app.use(
  "/images",
  setStaticHeaders,
  express.static(path.join(__dirname, "public/images"))
);

// Everything else in public/
app.use(express.static(path.join(__dirname, "public")));

// ================================================================
// API ROUTES
// ================================================================
app.use("/api/auth", authRoutes);
app.use("/api/register", jvzooRoutes);
app.use("/api/password", passwordResetRoutes);
app.use("/api/plans", planRoutes);
app.use('/api/agency', agencyRoutes);
app.use("/api/ai-ranker", aiRankerRoutes);
app.use("/api/ai-profit", aiProfitRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/templates", templateRoutes);  
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/video", require("./routes/videoRoutes")); // ✅ NEW


// ================================================================
// 404 + ERROR HANDLERS (MUST be last)
// ================================================================
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

// ================================================================
// MONGODB + SERVER START
// ================================================================
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/product-factory";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("⚠️ MongoDB not connected:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads/...`);
  console.log(`📦 Categories: http://localhost:${PORT}/api/categories`);
  console.log(`📦 Templates: http://localhost:${PORT}/api/templates\n`);
});

module.exports = app;
// backend/src/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const aiController = require("../controllers/aiController");
const auth = require("../middleware/auth");

router.post("/enhance", auth, aiController.enhanceDialog);
router.post("/dialogue", auth, aiController.generateDialogue);
router.post("/publish-kit", auth, aiController.generatePublishKit);
router.post("/growth-plan", auth, aiController.generateGrowthPlan);
router.post("/brand-kit", auth, aiController.generateBrandKit);

// SSE endpoint — auth via query string token
router.get(
  "/trending-stream",
  (req, res, next) => {
    const token = req.query.token;
    if (!token) return res.status(401).json({ message: "No token" });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
    } catch {
      return res.status(401).json({ message: "Token invalid" });
    }
  },
  aiController.generateTrendingStream
);

module.exports = router;
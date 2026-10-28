// backend/routes/videoRoutes.js
const express = require("express");
const authMiddleware = require("../middleware/auth");   // 👈 no { } — default import
const {
  generateVideo,
  getMyVideos,
  getVideo,
  deleteVideo,
  bulkDeleteVideos,
  getGenerationStats,
  mergeVideos,
} = require("../controllers/videoController");

const router = express.Router();

router.post("/generate", authMiddleware, generateVideo);
router.get("/my-videos", authMiddleware, getMyVideos);
router.get("/generation-stats", authMiddleware, getGenerationStats);
router.get("/:id", authMiddleware, getVideo);
router.delete("/:id", authMiddleware, deleteVideo);
router.post("/bulk-delete", authMiddleware, bulkDeleteVideos);
router.post("/merge", authMiddleware, mergeVideos);

module.exports = router;

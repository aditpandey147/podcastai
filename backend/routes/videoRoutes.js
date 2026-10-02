// backend/routes/videoRoutes.js
const express = require("express");
const authMiddleware = require("../middleware/auth");   // 👈 no { } — default import
const {
  generateVideo,
  getMyVideos,
  getVideo,
} = require("../controllers/videoController");

const router = express.Router();

router.post("/generate", authMiddleware, generateVideo);
router.get("/my-videos", authMiddleware, getMyVideos);
router.get("/:id", authMiddleware, getVideo);

module.exports = router;
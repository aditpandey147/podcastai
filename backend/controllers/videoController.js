// backend/src/controllers/videoController.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Video = require("../models/Video");
const ai = require("../services/aiService");

// ================================================================
// 📁 VIDEOS DIRECTORY
// ================================================================
const VIDEOS_DIR = path.join(__dirname, "..", "uploads", "videos");
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// ================================================================
// Helper — resolve user ID from any JWT payload shape
// ================================================================
function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id || null;
}

// ================================================================
// Helper — build an absolute URL from a possibly-relative path
// ================================================================
function buildAbsoluteUrl(input) {
  if (!input) return "";
  // Already absolute?
  if (/^https?:\/\//i.test(input)) return input;

  const SERVER_URL =
    process.env.SERVER_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  const cleanPath = input.startsWith("/") ? input : `/${input}`;
  return `${SERVER_URL}${cleanPath}`;
}

// ================================================================
// Helper — download a remote video URL → local file
// Returns local relative path: "/uploads/videos/video-1-....mp4"
// ================================================================
async function downloadVideoToLocal(remoteUrl, videoId) {
  if (!remoteUrl) throw new Error("remoteUrl is required");

  const filename = `video-${videoId}-${Date.now()}.mp4`;
  const filePath = path.join(VIDEOS_DIR, filename);

  console.log(`⬇️  Downloading video → ${filename}`);

  const response = await axios({
    method: "GET",
    url: remoteUrl,
    responseType: "stream",
    timeout: 120000,
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  console.log(`✅ Video saved locally: ${filePath}`);

  return `/uploads/videos/${filename}`;
}

// ================================================================
// POST /api/video/generate
// ================================================================
exports.generateVideo = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      console.error("❌ No user ID — req.user =", req.user);
      return res.status(401).json({
        success: false,
        message: "Not authenticated — user ID missing",
      });
    }

    const {
      imageUrl: incomingImageUrl,
      hostLine,
      guestLine,
      tone = "professional",
      music = "subtle",
      format = "16:9",
      templateId,
      templateTitle,
      templateCategory,
      coverImage,
    } = req.body;

    // 🎯 Use the user-selected image
    const rawImageUrl = incomingImageUrl || coverImage || "";

    if (!rawImageUrl) {
      return res.status(400).json({
        success: false,
        message: "No image selected — please choose a template or image",
      });
    }

    // Convert relative → absolute (Replicate needs a public URL)
    const imageUrl = buildAbsoluteUrl(rawImageUrl);

    console.log("🖼️ Using user image:", imageUrl);

    if (!hostLine || !guestLine) {
      return res
        .status(400)
        .json({ success: false, message: "Both dialog lines required" });
    }

    // ---- Create video record (queued) ----
    const videoDoc = await Video.create({
      userId,
      templateId: templateId || null,
      title: templateTitle || "Untitled Podcast",
      category: templateCategory || "",
      coverImage: imageUrl, // save the actual image URL used
      hostLine,
      guestLine,
      tone,
      music,
      format,
      status: "queued",
      progress: 0,
    });

    // ---- Kick off async pipeline (don't await) ----
    processVideo(videoDoc._id, imageUrl).catch((err) =>
      console.error("processVideo async error:", err)
    );

    res.json({
      success: true,
      videoId: videoDoc.id,
      video: videoDoc.toJSON(),
    });
  } catch (err) {
    console.error("generateVideo error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// ASYNC PIPELINE
// ================================================================
async function processVideo(videoMongoId, imageUrl) {
  let localVideoPath = null;

  try {
    // ---- Step 1: Vision → prompt ----
    await Video.findByIdAndUpdate(videoMongoId, {
      status: "processing",
      progress: 15,
    });

    const doc = await Video.findById(videoMongoId);
    if (!doc) return;

    const videoPrompt = await ai.vision({
      imageUrl,
      systemPrompt: `You are an AI video prompt engineer. Write ONE detailed image-to-video prompt describing camera motion, character micro-movements, ambient details, lighting, mood. Output ONLY the prompt, under 120 words.`,
      prompt: `Dialog:
Host: "${doc.hostLine}"
Guest: "${doc.guestLine}"

Tone: ${doc.tone}
Music: ${doc.music}
Aspect Ratio: ${doc.format}

Write the image-to-video prompt.`,
    });

    await Video.findByIdAndUpdate(videoMongoId, {
      videoPrompt,
      progress: 35,
    });

    console.log("✅ Video prompt:", videoPrompt);

    // ---- Step 2: Video generation ----
    const remoteVideoUrl = await ai.video({
      imageUrl,
      prompt: videoPrompt,
      format: doc.format,
    });

    console.log("🎥 Replicate URL:", remoteVideoUrl);

    // ---- Step 3: Download to local ----
    localVideoPath = await downloadVideoToLocal(remoteVideoUrl, doc.id);

    // ---- Step 4: Save both paths in DB ----
    await Video.findByIdAndUpdate(videoMongoId, {
      videoUrl: remoteVideoUrl,
      localVideoUrl: localVideoPath,
      status: "completed",
      progress: 100,
    });

    console.log(`✅ Video ${doc.id} ready at ${localVideoPath}`);
  } catch (err) {
    console.error("processVideo error:", err.response?.data || err.message);

    if (localVideoPath) {
      try {
        const filePath = path.join(VIDEOS_DIR, path.basename(localVideoPath));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (_) {}
    }

    await Video.findByIdAndUpdate(videoMongoId, {
      status: "failed",
      errorMessage:
        err.response?.data?.error?.message ||
        err.message ||
        "Generation failed",
    });
  }
}

// ================================================================
// GET /api/video/my-videos
// ================================================================
exports.getMyVideos = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const videos = await Video.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: videos.length, data: videos });
  } catch (err) {
    console.error("getMyVideos error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// GET /api/video/:id
// ================================================================
exports.getVideo = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const video = await Video.findOne({
      id: Number(req.params.id),
      userId,
    });

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    res.json({ success: true, data: video.toJSON() });
  } catch (err) {
    console.error("getVideo error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

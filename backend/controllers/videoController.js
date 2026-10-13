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
  if (/^https?:\/\//i.test(input)) return input;

  const SERVER_URL =
    process.env.SERVER_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  const cleanPath = input.startsWith("/") ? input : `/${input}`;
  return `${SERVER_URL}${cleanPath}`;
}

// ================================================================
// Helper — delete a local file from disk (safe — never throws)
// Only deletes files inside /uploads/videos/
// ================================================================
function deleteLocalVideoFile(urlOrPath) {
  if (!urlOrPath) return false;

  try {
    // Extract pathname if it's a full URL
    let pathname = urlOrPath;
    if (/^https?:\/\//i.test(urlOrPath)) {
      try {
        pathname = new URL(urlOrPath).pathname;
      } catch {
        return false;
      }
    }

    // Only handle /uploads/videos/* files
    if (!pathname.startsWith("/uploads/videos/")) {
      return false;
    }

    const filename = path.basename(pathname);
    const filePath = path.join(VIDEOS_DIR, filename);

    // Safety: ensure resolved path is inside VIDEOS_DIR
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(VIDEOS_DIR))) {
      console.warn("🚫 Refusing to delete outside VIDEOS_DIR:", resolved);
      return false;
    }

    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
      console.log("🗑️  Deleted file:", resolved);
      return true;
    }
  } catch (err) {
    console.warn("⚠️  File delete warning:", err.message);
  }
  return false;
}

// ================================================================
// Helper — download a remote video URL → local file
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
      format = "landscape",
      templateId,
      templateTitle,
      templateCategory,
      coverImage,
    } = req.body;

    console.log("📥 Incoming format from frontend:", format);

    const rawImageUrl = incomingImageUrl || coverImage || "";

    if (!rawImageUrl) {
      return res.status(400).json({
        success: false,
        message: "No image selected — please choose a template or image",
      });
    }

    const imageUrl = buildAbsoluteUrl(rawImageUrl);
    console.log("🖼️ Using user image:", imageUrl);

    if (!hostLine || !guestLine) {
      return res
        .status(400)
        .json({ success: false, message: "Both dialog lines required" });
    }

    const videoDoc = await Video.create({
      userId,
      templateId: templateId || null,
      title: templateTitle || "Untitled Podcast",
      category: templateCategory || "",
      coverImage: imageUrl,
      hostLine,
      guestLine,
      tone,
      music,
      format,
      status: "queued",
      progress: 0,
    });

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
    console.log("🎬 Passing to ai.video → format:", doc.format);

    const remoteVideoUrl = await ai.videoFast({
      imageUrl,
      prompt: videoPrompt,
      format: doc.format,   // only thing that varies per user
    });

    console.log("🎥 Replicate URL:", remoteVideoUrl);

    localVideoPath = await downloadVideoToLocal(remoteVideoUrl, doc.id);

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

// ================================================================
// DELETE /api/video/:id
// Deletes the DB record AND the local file from disk
// ================================================================
exports.deleteVideo = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const idNum = Number(req.params.id);
    if (!Number.isFinite(idNum)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video id" });
    }

    // Find the video — verify ownership
    const video = await Video.findOne({ id: idNum, userId });

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    // ---- Delete local file(s) from disk (best-effort) ----
    const filesToDelete = [
      video.localVideoUrl,
      video.videoUrl, // only matches /uploads/videos/* — URLs pointing elsewhere are skipped
    ].filter(Boolean);

    const deletedFiles = [];
    for (const url of filesToDelete) {
      if (deleteLocalVideoFile(url)) {
        deletedFiles.push(url);
      }
    }

    // ---- Delete DB record ----
    await Video.deleteOne({ _id: video._id });

    console.log(
      `🗑️  Deleted video ${idNum} (files removed: ${deletedFiles.length})`
    );

    res.json({
      success: true,
      message: "Video deleted",
      deletedId: idNum,
      deletedFiles,
    });
  } catch (err) {
    console.error("deleteVideo error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// POST /api/video/bulk-delete
// body: { videoIds: [1, 3, 5] }
// ================================================================
exports.bulkDeleteVideos = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const { videoIds } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "videoIds array required" });
    }

    // Fetch only the user's videos
    const videos = await Video.find({
      id: { $in: videoIds },
      userId,
    });

    if (videos.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching videos found" });
    }

    // ---- Delete local files ----
    let filesDeleted = 0;
    for (const v of videos) {
      const urls = [v.localVideoUrl, v.videoUrl].filter(Boolean);
      for (const url of urls) {
        if (deleteLocalVideoFile(url)) filesDeleted++;
      }
    }

    // ---- Delete DB records ----
    const result = await Video.deleteMany({
      _id: { $in: videos.map((v) => v._id) },
    });

    console.log(
      `🗑️  Bulk deleted ${result.deletedCount} videos (files removed: ${filesDeleted})`
    );

    res.json({
      success: true,
      message: `${result.deletedCount} video(s) deleted`,
      deletedCount: result.deletedCount,
      filesDeleted,
    });
  } catch (err) {
    console.error("bulkDeleteVideos error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
